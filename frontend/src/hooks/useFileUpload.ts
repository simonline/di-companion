import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export interface FileUpload {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  bucket: string;
  s3_key: string;
  s3_url: string;
  cdn_url?: string;
  category?: string;
  entity_type?: string;
  entity_id?: string;
  is_public: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface UploadOptions {
  category?: string;
  entityType?: string;
  entityId?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

interface UseFileUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<FileUpload | null>;
  uploadMultiple: (files: File[], options?: UploadOptions) => Promise<FileUpload[]>;
  deleteFile: (fileId: string) => Promise<boolean>;
  getSignedUrl: (fileId: string, expiresIn?: number) => Promise<string | null>;
  getFilesByEntity: (entityType: string, entityId: string) => Promise<FileUpload[]>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (
    file: File,
    options: UploadOptions = {}
  ): Promise<FileUpload | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get presigned upload URL from backend
      const { data: presignData } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/files/presigned-upload`,
        {
          filename: file.name,
          content_type: file.type,
          size_bytes: file.size,
          category: options.category || 'general',
          entity_type: options.entityType,
          entity_id: options.entityId,
        }
      );

      // Upload directly to S3 using presigned URL
      const formData = new FormData();
      Object.entries(presignData.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      await axios.post(presignData.url, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
            options.onProgress?.(percentCompleted);
          }
        },
      });

      // Save file metadata to Supabase
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          filename: presignData.filename,
          original_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          bucket: presignData.bucket,
          s3_key: presignData.s3_key,
          s3_url: presignData.s3_url,
          etag: presignData.etag,
          category: options.category,
          entity_type: options.entityType,
          entity_id: options.entityId,
          is_public: options.isPublic ?? false,
          metadata: options.metadata,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setProgress(100);
      return fileRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultiple = useCallback(async (
    files: File[],
    options: UploadOptions = {}
  ): Promise<FileUpload[]> => {
    const results: FileUpload[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressOffset = (i / files.length) * 100;
      const progressRange = 100 / files.length;
      
      const result = await upload(file, {
        ...options,
        onProgress: (fileProgress) => {
          const totalProgress = progressOffset + (fileProgress * progressRange / 100);
          setProgress(Math.round(totalProgress));
          options.onProgress?.(totalProgress);
        },
      });
      
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }, [upload]);

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      // Get file info first
      const { data: file } = await supabase
        .from('files')
        .select('s3_key')
        .eq('id', fileId)
        .single();

      if (!file) return false;

      // Delete from S3
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/files/${fileId}`
      );

      // Soft delete in database
      const { error } = await supabase
        .from('files')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', fileId);

      return !error;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  }, []);

  const getSignedUrl = useCallback(async (
    fileId: string,
    expiresIn: number = 3600
  ): Promise<string | null> => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/files/${fileId}/signed-url`,
        { params: { expires_in: expiresIn } }
      );
      return data.url;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      return null;
    }
  }, []);

  const getFilesByEntity = useCallback(async (
    entityType: string,
    entityId: string
  ): Promise<FileUpload[]> => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching files:', err);
      return [];
    }
  }, []);

  return {
    upload,
    uploadMultiple,
    deleteFile,
    getSignedUrl,
    getFilesByEntity,
    uploading,
    progress,
    error,
  };
};