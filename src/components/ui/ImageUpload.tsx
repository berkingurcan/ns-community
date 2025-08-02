'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from './Button';
import { ImageUploadService } from '@/lib/imageUpload';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
  walletAddress: string;
  isLoading?: boolean;
}

export function ImageUpload({ 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved, 
  walletAddress, 
  isLoading = false 
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    setErrorMessage(null);

    // Validate file
    const validation = ImageUploadService.validateFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Check storage setup first
      const setupCheck = await ImageUploadService.checkStorageSetup();
      if (!setupCheck.isSetup) {
        throw new Error(setupCheck.error || 'Storage not properly configured');
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      // Compress image if it's large
      let fileToUpload = file;
      if (file.size > 1024 * 1024) { // If > 1MB, compress
        try {
          fileToUpload = await ImageUploadService.compressImage(file, 800, 0.8);
        } catch (error) {
          console.warn('Image compression failed, using original:', error);
        }
      }

      // Upload to Supabase
      const result = await ImageUploadService.uploadImage(fileToUpload, walletAddress);
      
      // Clean up preview URL
      if (previewUrl !== currentImageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(result.url);
      onImageUploaded(result.url);
      setErrorMessage(null);
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      setErrorMessage(error.message || 'Failed to upload image');
      
      // Reset preview on error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  }, [walletAddress, currentImageUrl, onImageUploaded]);

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
    if (previewUrl && previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMessage(null);
    onImageRemoved();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl, currentImageUrl, onImageRemoved]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground mb-2">
        Project Logo
      </label>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}
      
      {/* Image Preview */}
      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Project logo preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-border"
          />
          {!isUploading && !isLoading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm hover:bg-destructive/80"
            >
              ×
            </button>
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
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-secondary-foreground">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-foreground mb-1">
                Drag and drop your logo here, or{' '}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-primary hover:text-primary/80 underline"
                  disabled={isUploading || isLoading}
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-secondary-foreground">
                PNG, JPG, GIF, WebP up to 5MB
              </p>
            </div>
          </div>
        </div>
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
            Change Logo
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
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