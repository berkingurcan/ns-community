'use client';

import NextImage from 'next/image';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { ImageUploadService } from '@/lib/imageUpload';
import { useAuth } from '@/context/AuthContext';
import { Image, X, Upload } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
  isLoading?: boolean;
}

export function ImageUpload({ 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved, 
  isLoading = false 
}: ImageUploadProps) {
  const { session } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsToCleanup = useRef<Set<string>>(new Set());

  // Sync with parent state changes
  useEffect(() => {
    if (currentImageUrl !== previewUrl && !isUploading) {
      setPreviewUrl(currentImageUrl || null);
      setLocalPreviewUrl(null);
    }
  }, [currentImageUrl, previewUrl, isUploading]);

  // Cleanup on unmount only
  useEffect(() => {
    const urlsToCleanup = blobUrlsToCleanup.current;
    return () => {
      // Clean up all tracked blob URLs when component unmounts
      urlsToCleanup.forEach(url => {
        URL.revokeObjectURL(url);
      });
      urlsToCleanup.clear();
    };
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!session?.user?.id) {
      setErrorMessage("You must be logged in to upload an image.");
      return;
    }

    setErrorMessage(null);

    // Validate file
    const validation = ImageUploadService.validateFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    let tempPreviewUrl: string | null = null;
    
    // Add timeout for the entire upload process
    const uploadTimeout = 90000; // 90 seconds total timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Image upload timed out')), uploadTimeout)
    );
    
    try {
      const uploadProcess = async () => {
        // Create local preview immediately
        tempPreviewUrl = URL.createObjectURL(file);
        blobUrlsToCleanup.current.add(tempPreviewUrl);
        setLocalPreviewUrl(tempPreviewUrl);
        setPreviewUrl(tempPreviewUrl);

        // Compress image if it's large
        let fileToUpload = file;
        if (file.size > 1024 * 1024) { // If > 1MB, compress
          try {
            fileToUpload = await ImageUploadService.compressImage(file, 800, 0.8);
          } catch (error) {
            console.warn('Image compression failed, using original:', error);
            // Continue with original file if compression fails
          }
        }

        // Upload to Supabase
        const result = await ImageUploadService.uploadImage(fileToUpload, session.user.id);
        
        // Only clean up and update after successful upload
        if (tempPreviewUrl) {
          URL.revokeObjectURL(tempPreviewUrl);
          blobUrlsToCleanup.current.delete(tempPreviewUrl);
          setLocalPreviewUrl(null);
        }
        
        // Update to the uploaded URL
        setPreviewUrl(result.url);
        onImageUploaded(result.url);
        setErrorMessage(null);
      };

      await Promise.race([uploadProcess(), timeoutPromise]);
      
    } catch (error: unknown) {
      console.error('Upload failed:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to upload image';
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('timed out')) {
          errorMessage = 'Upload timed out. Please check your connection and try a smaller image.';
        } else if (error.message.includes('authentication') || error.message.includes('Permission denied')) {
          errorMessage = 'Authentication error. Please sign in again and try.';
        } else if (error.message.includes('Storage not properly configured')) {
          errorMessage = 'Storage system is not available. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrorMessage(errorMessage);
      
      // Clean up local preview on error
      if (tempPreviewUrl) {
        URL.revokeObjectURL(tempPreviewUrl);
        blobUrlsToCleanup.current.delete(tempPreviewUrl);
        setLocalPreviewUrl(null);
      }
      
      // Reset to current image or null, but don't cause flash
      setPreviewUrl(currentImageUrl || null);
    } finally {
      // Ensure uploading state is always reset
      setIsUploading(false);
    }
  }, [session, currentImageUrl, onImageUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback(() => {
    // Clean up any local preview URL
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      blobUrlsToCleanup.current.delete(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    
    // Clean up preview URL if it's a blob URL (not a Supabase URL)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      blobUrlsToCleanup.current.delete(previewUrl);
    }
    
    setPreviewUrl(null);
    setErrorMessage(null);
    onImageRemoved();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl, localPreviewUrl, onImageRemoved]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <Label>
        Project Logo
      </Label>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}
      
      {/* Image Preview */}
      {previewUrl && (
        <div className="relative inline-block">
          <NextImage
            src={previewUrl}
            alt="Project logo preview"
            width={128}
            height={128}
            className="w-32 h-32 object-cover rounded-lg border-2 border-border"
          />
          {!isUploading && !isLoading && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-white text-sm">Uploading...</div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
          <label
            htmlFor="file-upload"
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="space-y-4"
            >
              <div className="mx-auto w-12 h-12 text-muted-foreground flex items-center justify-center">
                <Image className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-foreground mb-1">
                  Drag and drop your logo here, or{' '}
                  <span
                    className="text-primary font-semibold hover:underline"
                  >
                    browse files
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            </div>
          </label>
      )}

      {/* Action Buttons */}
      {previewUrl && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={isUploading || isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Change Logo
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        id="file-upload"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading || isLoading}
      />
    </div>
  );
}