import { useState } from 'react';
import axiosInstance from '@/lib/axios';

export type DocumentType = 'interview' | 'pitch_deck' | 'financial_plan' | 'workshop_capture' | 'other';

export interface DocumentUpload {
    id: number;
    attributes: {
        title: string;
        description?: string;
        type: DocumentType;
        status: 'uploaded' | 'processing' | 'completed' | 'analyzed' | 'failed';
        file?: {
            data?: {
                id: number;
                attributes: {
                    url: string;
                    name: string;
                    size: number;
                    ext: string;
                };
            };
        };
        transcription?: string;
        summary?: string;
        insights?: any;
        tags?: any;
        metadata?: any;
        aiAnalysis?: any;
        created_at: string;
        updated_at: string;
    };
}

interface UseDocumentUploadOptions {
    type: DocumentType;
    onUploadSuccess?: () => void;
    onUploadError?: (error: any) => void;
}

export const useDocumentUpload = ({ type, onUploadSuccess, onUploadError }: UseDocumentUploadOptions) => {
    const [documents, setDocuments] = useState<DocumentUpload[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/document-uploads', {
                params: {
                    filters: { type },
                    populate: 'file',
                    sort: 'created_at:desc'
                }
            });
            setDocuments(response.data.data || []);
        } catch (error) {
            console.error(`Error fetching ${type} documents:`, error);
        } finally {
            setLoading(false);
        }
    };

    const uploadDocument = async (file: File, title: string, description?: string, metadata?: any) => {
        setUploading(true);
        try {
            // First upload the file
            const formData = new FormData();
            formData.append('files', file);

            const fileResponse = await axiosInstance.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedFile = fileResponse.data[0];

            // Then create the document upload entry
            const documentData = {
                data: {
                    title,
                    description,
                    type,
                    status: 'uploaded',
                    file: uploadedFile.id,
                    metadata,
                }
            };

            await axiosInstance.post('/api/document-uploads', documentData);

            // Refresh the list
            await fetchDocuments();

            if (onUploadSuccess) {
                onUploadSuccess();
            }

            return true;
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            if (onUploadError) {
                onUploadError(error);
            }
            return false;
        } finally {
            setUploading(false);
        }
    };

    const deleteDocument = async (id: number) => {
        try {
            await axiosInstance.delete(`/api/document-uploads/${id}`);
            await fetchDocuments();
            return true;
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            return false;
        }
    };

    const updateDocument = async (id: number, data: Partial<DocumentUpload['attributes']>) => {
        try {
            await axiosInstance.put(`/api/document-uploads/${id}`, {
                data
            });
            await fetchDocuments();
            return true;
        } catch (error) {
            console.error(`Error updating ${type}:`, error);
            return false;
        }
    };

    return {
        documents,
        loading,
        uploading,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
        updateDocument,
    };
};