import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  Grid,
  Chip,
  Avatar,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Download,
  AttachFile,
  ContentPaste,
  Close,
} from '@mui/icons-material';
import { uploadDocument, getDocuments, deleteDocument, getDocumentUrl, supabase } from '@/lib/supabase';
import type { Document } from '@/types/database';
import useNotifications from '@/store/notifications';
import { useAuthContext } from '@/hooks/useAuth';

interface DocumentManagerProps {
  category: string;
  entityType?: string;
  entityId?: string;
  entityField?: string;
  title?: string;
  description?: string;
  color?: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  category,
  entityType,
  entityId,
  entityField,
  title = 'Documents',
  description = 'Upload and manage documents',
  color = 'primary',
}) => {
  const { user } = useAuthContext();
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, [category, entityType, entityId, entityField]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const filters: any = { category };
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
          .select('id, name, email')
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
            category
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
          category
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

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
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
    if (!userId) return { name: 'Unknown', initials: '?' };
    const userInfo = users[userId];
    if (userInfo) {
      const name = userInfo.name || userInfo.email?.split('@')[0] || 'Unknown';
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
      return { name, initials };
    }
    return { name: 'Loading...', initials: '?' };
  };

  return (
    <Box>
      <Card sx={{ mb: 3, bgcolor: `${color}.lighter`, border: '2px solid', borderColor: `${color}.main` }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight="700" gutterBottom>
                📁 {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => {
                  setUploadMode('file');
                  setOpenDialog(true);
                }}
                size="large"
                color={color as any}
                sx={{ fontWeight: 'bold' }}
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
                size="large"
              >
                Paste Text
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No documents uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload files or paste text to get started
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {documents.map((doc) => {
            const uploader = getUserDisplay(doc.uploaded_by);
            return (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Paper
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: `${color}.main`,
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap title={doc.filename}>
                        {doc.filename}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'} • 
                        {(doc.size_bytes / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                    <AttachFile color="action" />
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: `${color}.main` }}>
                      {uploader.initials}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {uploader.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • {new Date(doc.uploaded_at).toLocaleDateString()}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                    <IconButton
                      size="small"
                      onClick={() => window.open(getDocumentUrl(doc.id), '_blank')}
                      title="View"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getDocumentUrl(doc.id);
                        link.download = doc.filename;
                        link.click();
                      }}
                      title="Download"
                    >
                      <Download fontSize="small" />
                    </IconButton>
                    {doc.uploaded_by === user?.id && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(doc.id)}
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
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
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ py: 2 }}
                >
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : 'Choose Files'}
                </Button>
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
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            disabled={
              uploading ||
              (uploadMode === 'file' && selectedFiles.length === 0) ||
              (uploadMode === 'paste' && (!pasteText || !uploadTitle))
            }
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManager;