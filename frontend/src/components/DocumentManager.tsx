import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  CloudUploadOutlined,
  DeleteOutline,
  FileDownloadOutlined,
  ContentPaste,
  Close,
  InsertDriveFileOutlined,
  DescriptionOutlined,
  ImageOutlined,
  MovieOutlined,
  AudiotrackOutlined,
  FolderZipOutlined,
  CodeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { uploadDocument, getDocuments, deleteDocument, updateDocument, getDocumentUrl, supabase } from '@/lib/supabase';
import type { Document } from '@/types/database';
import useNotifications from '@/store/notifications';
import { useAuthContext } from '@/hooks/useAuth';
import { categoryColors, CategoryEnum } from '@/utils/constants';

interface DocumentManagerProps {
  category?: CategoryEnum | null;
  entityType?: string;
  entityId?: string;
  entityField?: string;
  title?: string;
  description?: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  category,
  entityType,
  entityId,
  entityField,
  title = 'Documents',
  description = 'Upload and manage documents',
}) => {
  const { user, profile } = useAuthContext();
  const [, notificationActions] = useNotifications();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'paste'>('file');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, [category, entityType, entityId, entityField]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (entityType) filters.entityType = entityType;
      if (entityId) filters.entityId = entityId;
      if (entityField) filters.entityField = entityField;

      const docs = await getDocuments(filters);
      setDocuments(docs);

      // Fetch user info for each unique uploader
      const uniqueUserIds = [...new Set(docs.map(d => d.uploaded_by).filter(Boolean))];
      const userPromises = uniqueUserIds.map(async (userId) => {
        const { data } = await supabase
          .from('profiles')
          .select('id, given_name, family_name, email')
          .eq('id', userId!)
          .single();
        return { id: userId, data };
      });

      const userResults = await Promise.all(userPromises);
      const userMap: { [key: string]: any } = {};
      userResults.forEach(result => {
        if (result.data) {
          userMap[result.id!] = result.data;
        }
      });
      setUsers(userMap);
    } catch (error) {
      console.error('Error fetching documents:', error);
      notificationActions.push({
        message: 'Failed to load documents',
        options: { variant: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      if (files.length === 1 && !uploadTitle) {
        setUploadTitle(files[0].name);
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
    if (acceptedFiles.length === 1 && !uploadTitle) {
      setUploadTitle(acceptedFiles[0].name);
    }
    setUploadMode('file');
    setOpenDialog(true);
  }, [uploadTitle]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true, // We'll handle clicks manually
    noKeyboard: true,
  });

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (uploadMode === 'file' && selectedFiles.length > 0) {
        // Upload multiple files
        for (const file of selectedFiles) {
          await uploadDocument(
            file,
            entityType,
            entityId,
            entityField,
            undefined,
            selectedFiles.length === 1 ? uploadTitle : undefined,
            selectedFiles.length === 1 ? uploadDescription : undefined
          );
        }
        notificationActions.push({
          message: `${selectedFiles.length} file(s) uploaded successfully`,
          options: { variant: 'success' }
        });
      } else if (uploadMode === 'paste' && pasteText) {
        // Create a text file from pasted content
        const blob = new Blob([pasteText], { type: 'text/plain' });
        const file = new File([blob], `${uploadTitle || 'pasted-text'}.txt`, { type: 'text/plain' });

        await uploadDocument(
          file,
          entityType,
          entityId,
          entityField,
          undefined,
          uploadTitle,
          uploadDescription
        );
        notificationActions.push({
          message: 'Text uploaded successfully',
          options: { variant: 'success' }
        });
      }

      await fetchDocuments();
      handleCloseDialog();
    } catch (error) {
      console.error('Error uploading:', error);
      notificationActions.push({
        message: 'Failed to upload',
        options: { variant: 'error' }
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (docId: string) => {
    setDocumentToDelete(docId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete);
      await fetchDocuments();
      notificationActions.push({
        message: 'Document deleted successfully',
        options: { variant: 'success' }
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      notificationActions.push({
        message: 'Failed to delete document',
        options: { variant: 'error' }
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setDocumentToDelete(null);
  };

  const handleStartEdit = (doc: Document) => {
    setEditingDocId(doc.id);
    setEditTitle(doc.title || '');
    setEditDescription(doc.description || '');
  };

  const handleCancelEdit = () => {
    setEditingDocId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleSaveEdit = async (docId: string) => {
    try {
      await updateDocument(docId, {
        title: editTitle,
        description: editDescription,
      });
      await fetchDocuments();
      setEditingDocId(null);
      setEditTitle('');
      setEditDescription('');
      notificationActions.push({
        message: 'Document updated successfully',
        options: { variant: 'success' }
      });
    } catch (error) {
      console.error('Error updating document:', error);
      notificationActions.push({
        message: 'Failed to update document',
        options: { variant: 'error' }
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFiles([]);
    setPasteText('');
    setUploadTitle('');
    setUploadDescription('');
    setUploadMode('file');
  };

  const getUserDisplay = (userId: string | null) => {
    if (!userId) {
      // If no uploaded_by, use current user as fallback
      if (profile?.given_name) {
        return profile.given_name;
      }
      if (user) {
        return user.email?.split('@')[0] || 'You';
      }
      return 'Unknown';
    }

    // Check if it's the current user
    if (userId === user?.id && profile?.given_name) {
      return profile.given_name;
    }

    const userInfo = users[userId];
    if (userInfo) {
      // Use given_name if available, otherwise fall back to email
      const name = userInfo.given_name || userInfo.email?.split('@')[0] || 'Unknown';
      return name;
    }
    return 'Loading...';
  };

  const getFileIcon = (mimeType: string | null, filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const iconStyle = { fontSize: 40, color: 'text.secondary', opacity: 0.6 };

    // Check by MIME type first
    if (mimeType) {
      if (mimeType.startsWith('image/')) return <ImageOutlined sx={iconStyle} />;
      if (mimeType === 'application/pdf') return <DescriptionOutlined sx={iconStyle} />;
      if (mimeType.startsWith('video/')) return <MovieOutlined sx={iconStyle} />;
      if (mimeType.startsWith('audio/')) return <AudiotrackOutlined sx={iconStyle} />;
      if (mimeType.startsWith('text/')) return <DescriptionOutlined sx={iconStyle} />;
      if (mimeType.includes('zip') || mimeType.includes('compressed')) return <FolderZipOutlined sx={iconStyle} />;
    }

    // Check by file extension as fallback
    if (extension) {
      // Images
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(extension)) {
        return <ImageOutlined sx={iconStyle} />;
      }
      // PDF and Documents
      if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
        return <DescriptionOutlined sx={iconStyle} />;
      }
      // Videos
      if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'].includes(extension)) {
        return <MovieOutlined sx={iconStyle} />;
      }
      // Audio
      if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(extension)) {
        return <AudiotrackOutlined sx={iconStyle} />;
      }
      // Code
      if (['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml'].includes(extension)) {
        return <CodeOutlined sx={iconStyle} />;
      }
      // Archives
      if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
        return <FolderZipOutlined sx={iconStyle} />;
      }
    }

    // Default file icon
    return <InsertDriveFileOutlined sx={iconStyle} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<CloudUploadOutlined />}
              onClick={() => {
                setUploadMode('file');
                setOpenDialog(true);
              }}
              sx={{
                textTransform: 'none',
                boxShadow: 0,
                backgroundColor: category ? categoryColors[category] : 'primary.main',
                color: 'background.paper',
                '&:hover': {
                  boxShadow: 1,
                  backgroundColor: category ? categoryColors[category] : 'primary.dark',
                  filter: 'brightness(0.9)'
                }
              }}
            >
              Upload Files
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentPaste />}
              onClick={() => {
                setUploadMode('paste');
                setOpenDialog(true);
              }}
              sx={{
                textTransform: 'none',
                borderColor: category ? categoryColors[category] : 'divider',
                color: category ? categoryColors[category] : 'text.primary',
                '&:hover': {
                  borderColor: category ? categoryColors[category] : 'divider',
                  backgroundColor: category ? `${categoryColors[category]}10` : 'action.hover'
                }
              }}
            >
              Paste Text
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Upload Drop Zone - Always Visible */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive
            ? (category ? categoryColors[category] : 'primary.main')
            : 'divider',
          borderRadius: 2,
          bgcolor: isDragActive ? 'action.hover' : 'grey.50',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: category ? categoryColors[category] : 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
        onClick={() => {
          setUploadMode('file');
          setOpenDialog(true);
        }}
      >
        <input {...getInputProps()} />
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
          <CloudUploadOutlined sx={{ fontSize: 32, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body1" color="text.primary">
              {isDragActive ? 'Drop files here' : 'Drop files here or click to upload'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports all file types up to 50MB
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Paper sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}>
          <InsertDriveFileOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No documents yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload files or paste text to get started
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {documents.map((doc) => {
            const uploaderName = getUserDisplay(doc.uploaded_by);
            const isEditing = editingDocId === doc.id;

            return (
              <Paper
                key={doc.id}
                sx={{
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  border: '1px solid',
                  borderColor: isEditing ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  cursor: isEditing ? 'default' : 'pointer',
                  '&:hover': {
                    borderColor: isEditing ? 'primary.main' : 'text.secondary',
                    bgcolor: 'grey.50',
                    transform: isEditing ? 'none' : 'translateY(-1px)',
                    boxShadow: 1
                  }
                }}
                onClick={isEditing ? undefined : async () => {
                  // Force download by fetching and creating blob
                  try {
                    const response = await fetch(getDocumentUrl(doc.id, true));
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = doc.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Download failed:', error);
                    notificationActions.push({
                      message: 'Failed to download file',
                      options: { variant: 'error' }
                    });
                  }
                }}
              >
                {/* File Icon */}
                <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                  {getFileIcon(doc.mime_type, doc.filename)}
                </Box>

                {/* File Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <Stack spacing={1.5}>
                      <TextField
                        size="small"
                        label="Title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        fullWidth
                        onClick={(e) => e.stopPropagation()}
                      />
                      <TextField
                        size="small"
                        label="Description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Typography variant="caption" color="text.secondary">
                        File: {doc.filename}
                      </Typography>
                    </Stack>
                  ) : (
                    <>
                      {doc.title && (
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {doc.title}
                        </Typography>
                      )}
                      {doc.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {doc.description}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: doc.title ? 400 : 500,
                          mb: 0.5,
                          color: doc.title ? 'text.secondary' : 'text.primary'
                        }}
                        noWrap
                        title={doc.filename}
                      >
                        {doc.filename}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(doc.size_bytes)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {uploaderName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: new Date(doc.uploaded_at).getFullYear() !== new Date().getFullYear()
                              ? 'numeric'
                              : undefined
                          })}
                        </Typography>
                      </Stack>
                    </>
                  )}
                </Box>

                {/* Actions */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(doc.id);
                          }}
                          sx={{
                            color: 'success.main',
                            '&:hover': {
                              bgcolor: 'success.lighter'
                            }
                          }}
                        >
                          <CheckOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <CloseOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={async (e) => {
                            e.stopPropagation();
                            // Force download by fetching and creating blob
                            try {
                              const response = await fetch(getDocumentUrl(doc.id, true));
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = doc.filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error('Download failed:', error);
                              notificationActions.push({
                                message: 'Failed to download file',
                                options: { variant: 'error' }
                              });
                            }
                          }}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <FileDownloadOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {(doc.uploaded_by === user?.id || !doc.uploaded_by) && (
                        <>
                          <Tooltip title="Edit title/description">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(doc);
                              }}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  bgcolor: 'action.hover'
                                }
                              }}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(doc.id);
                              }}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'error.main',
                                  bgcolor: 'error.lighter'
                                }
                              }}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {uploadMode === 'file' ? 'Upload Files' : 'Paste Text'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {uploadMode === 'file' ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileSelect}
                />
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: category ? categoryColors[category] : 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <CloudUploadOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file(s) selected`
                      : 'Drop files here or click to browse'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Maximum file size: 50MB
                  </Typography>
                </Box>
                {selectedFiles.length > 0 && (
                  <Box>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => {
                          setSelectedFiles(files => files.filter((_, i) => i !== index));
                        }}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
                {selectedFiles.length === 1 && (
                  <TextField
                    label="Title (optional)"
                    fullWidth
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter a title for this document"
                  />
                )}
              </>
            ) : (
              <>
                <TextField
                  label="Title"
                  fullWidth
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter a title for this text"
                  required
                />
                <TextField
                  label="Content"
                  fullWidth
                  multiline
                  rows={10}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your text here..."
                  required
                />
              </>
            )}

            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Add a description..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadOutlined />}
            disabled={
              uploading ||
              (uploadMode === 'file' && selectedFiles.length === 0) ||
              (uploadMode === 'paste' && (!pasteText || !uploadTitle))
            }
            sx={{
              textTransform: 'none',
              boxShadow: 0,
              backgroundColor: category ? categoryColors[category] : 'primary.main',
              '&:hover': {
                boxShadow: 1,
                backgroundColor: category ? categoryColors[category] : 'primary.dark',
                filter: 'brightness(0.9)'
              }
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Document?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this document? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              boxShadow: 0,
              '&:hover': {
                boxShadow: 1
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManager;