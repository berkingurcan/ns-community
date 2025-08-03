import { supabase } from './supabaseClient';

export interface ImageUploadResult {
  url: string;
  path: string;
}

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'project-logos';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // Diagnostic function to check storage setup with timeout
  static async checkStorageSetup(): Promise<{ isSetup: boolean; error?: string; session?: unknown }> {
    const setupTimeout = 10000; // 10 seconds timeout
    
    try {
      const setupPromise = this.performStorageCheck();
      const timeoutPromise = new Promise<{ isSetup: false; error: string }>((_, reject) =>
        setTimeout(() => reject(new Error('Storage check timeout')), setupTimeout)
      );

      return await Promise.race([setupPromise, timeoutPromise]);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return { 
          isSetup: false, 
          error: 'Storage check timed out. Please check your connection.' 
        };
      }
      return { 
        isSetup: false, 
        error: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Internal storage check method
  private static async performStorageCheck(): Promise<{ isSetup: boolean; error?: string; session?: unknown }> {
    try {
      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        return { isSetup: false, error: `Session error: ${sessionError.message}`, session: null };
      }

      if (!session) {
        return { isSetup: false, error: 'Not authenticated', session: null };
      }

      // Try to list files in the bucket (this will test bucket access)
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });

      if (error) {
        return { 
          isSetup: false, 
          error: `Storage access error: ${error.message}`, 
          session: session.user 
        };
      }

      return { 
        isSetup: true, 
        session: session.user 
      };
    } catch (error: unknown) {
      return { 
        isSetup: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Validate file before upload
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' };
    }

    return { isValid: true };
  }

  // Generate unique filename
  static generateFileName(walletAddress: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${walletAddress}/${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
  }

  // Upload image to Supabase Storage with timeout
  static async uploadImage(file: File, walletAddress: string): Promise<ImageUploadResult> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const uploadTimeout = 30000; // 30 seconds timeout

    try {
      // Wrap the upload operation with timeout
      const uploadPromise = this.performUpload(file, walletAddress);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout: Operation took too long')), uploadTimeout)
      );

      return await Promise.race([uploadPromise, timeoutPromise]);
    } catch (error) {
      console.error('Image upload error:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('Upload timed out. Please check your connection and try again.');
      }
      throw error;
    }
  }

  // Internal upload method without timeout
  private static async performUpload(file: File, walletAddress: string): Promise<ImageUploadResult> {
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error. Please sign in again.');
    }

    if (!session) {
      throw new Error('You must be signed in to upload images.');
    }

    console.log('User is authenticated, proceeding with upload...');

    // Generate unique filename
    const fileName = this.generateFileName(walletAddress, file.name);
    console.log('Generated filename:', fileName);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error details:', error);
      
      // Provide more specific error messages
      if (error.message.includes('row-level security')) {
        throw new Error('Permission denied. Please make sure you are signed in and try again.');
      } else if (error.message.includes('duplicate')) {
        throw new Error('A file with this name already exists. Please try again.');
      } else {
        throw new Error(`Failed to upload image: ${error.message}`);
      }
    }

    if (!data) {
      throw new Error('Upload failed: No data returned');
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName
    };
  }

  // Delete image from Supabase Storage
  static async deleteImage(imagePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([imagePath]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      console.error('Image deletion error:', error);
      throw error;
    }
  }

  // Update project logo (delete old, upload new)
  static async updateProjectLogo(
    newFile: File, 
    walletAddress: string, 
    oldImagePath?: string
  ): Promise<ImageUploadResult> {
    try {
      // Upload new image first
      const uploadResult = await this.uploadImage(newFile, walletAddress);

      // Delete old image if it exists
      if (oldImagePath) {
        try {
          await this.deleteImage(oldImagePath);
        } catch (error) {
          // Log error but don't fail the upload
          console.warn('Failed to delete old image:', error);
        }
      }

      return uploadResult;
    } catch (error) {
      console.error('Update project logo error:', error);
      throw error;
    }
  }

  // Compress image before upload (optional enhancement)
  static compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let newWidth = width;
        let newHeight = height;
        
        if (width > maxWidth) {
          newWidth = maxWidth;
          newHeight = maxWidth / aspectRatio;
        }

        // Set canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Get image path from URL
  static getImagePathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      const bucketIndex = pathSegments.findIndex(segment => segment === this.BUCKET_NAME);
      
      if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
        return pathSegments.slice(bucketIndex + 1).join('/');
      }
      
      return null;
    } catch {
      return null;
    }
  }
}