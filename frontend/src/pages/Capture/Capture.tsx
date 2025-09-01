import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Save,
  Delete,
  Edit,
  Add,
  LightbulbOutlined,
  DescriptionOutlined,
  LinkOutlined,
  AttachFile,
  Close,
  CloudUpload,
  Download,
  Visibility,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';
import { uploadDocument, getDocuments, deleteDocument, getDocumentUrl, supabase } from '@/lib/supabase';
import type { Document } from '@/types/database';

interface CaptureItem {
  id: string;
  type: 'idea' | 'note' | 'link' | 'file';
  title: string;
  content: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  documentId?: string;
}

const typeIcons = {
  idea: <LightbulbOutlined />,
  note: <DescriptionOutlined />,
  link: <LinkOutlined />,
  file: <AttachFile />,
};

const typeColors = {
  idea: 'warning',
  note: 'info',
  link: 'primary',
  file: 'success',
} as const;

const Capture: React.FC = () => {
  const { user } = useAuthContext();
  const [, notificationActions] = useNotifications();
  const [items, setItems] = useState<CaptureItem[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<{ [key: string]: any }>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<CaptureItem | null>(null);
  const [formData, setFormData] = useState({
    type: 'idea' as CaptureItem['type'],
    title: '',
    content: '',
    tags: '',
  });
  const [filter, setFilter] = useState<'all' | CaptureItem['type']>('all');
  const [uploading, setUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem(`capture_items_${user?.id}`);
    if (savedItems) {
      setItems(JSON.parse(savedItems).map((item: any) => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      })));
    }
    fetchDocuments();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    if (!user?.id) return;
    setLoadingDocs(true);
    try {
      const docs = await getDocuments({ category: 'workshop_capture' });
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
    } finally {
      setLoadingDocs(false);
    }
  };

  const saveItems = (newItems: CaptureItem[]) => {
    localStorage.setItem(`capture_items_${user?.id}`, JSON.stringify(newItems));
    setItems(newItems);
  };

  const handleOpenDialog = (item?: CaptureItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        type: item.type,
        title: item.title,
        content: item.content,
        tags: item.tags.join(', '),
      });
    } else {
      setEditingItem(null);
      setFormData({
        type: 'idea',
        title: '',
        content: '',
        tags: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setSelectedFile(null);
    setFormData({
      type: 'idea',
      title: '',
      content: '',
      tags: '',
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      notificationActions.push({ message: 'Title is required', options: { variant: 'error' } });
      return;
    }

    let documentId: string | undefined;
    
    if (formData.type === 'file' && selectedFile) {
      setUploading(true);
      try {
        const uploadedId = await uploadDocument(
          selectedFile,
          undefined,
          undefined,
          undefined,
          'workshop_capture'
        );
        if (uploadedId) {
          documentId = uploadedId;
          await fetchDocuments();
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        notificationActions.push({ 
          message: 'Failed to upload file', 
          options: { variant: 'error' } 
        });
      } finally {
        setUploading(false);
      }
    }

    const newItem: CaptureItem = {
      id: editingItem?.id || Date.now().toString(),
      type: formData.type,
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag),
      created_at: editingItem?.created_at || new Date(),
      updated_at: new Date(),
      documentId,
    };

    const updatedItems = editingItem
      ? items.map(item => item.id === editingItem.id ? newItem : item)
      : [...items, newItem];

    saveItems(updatedItems);
    notificationActions.push({
      message: editingItem ? 'Item updated successfully' : 'Item saved successfully',
      options: { variant: 'success' }
    });
    handleCloseDialog();
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item?.documentId) {
      try {
        await deleteDocument(item.documentId);
        await fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
    const updatedItems = items.filter(item => item.id !== id);
    saveItems(updatedItems);
    notificationActions.push({ message: 'Item deleted successfully', options: { variant: 'success' } });
  };

  const handleDeleteDocument = async (docId: string) => {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData({ ...formData, title: file.name });
      }
    }
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

  const handleUploadClick = () => {
    setFormData({ type: 'file', title: '', content: '', tags: '' });
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.type === filter);

  return (
    <>
      <Header title="Add your content" />
      <CenteredFlexBox>
        <Box sx={{ maxWidth: 1200, width: '100%', px: 2 }}>
          <Card sx={{ mb: 3, bgcolor: 'primary.lighter', border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={2}
              >
                <Box>
                  <Typography variant="h5" fontWeight="700" gutterBottom>
                    📁 Upload Documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload workshop materials, PDFs, images, and other documents
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={handleUploadClick}
                  size="large"
                  color="primary"
                  sx={{
                    minWidth: { xs: '100%', sm: 'auto' },
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold'
                  }}
                >
                  Upload File
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={2}
              >
                <Box>
                  <Typography variant="h5" fontWeight="700" gutterBottom>
                    Add your content
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Save ideas, notes, and links from your workshops and brainstorming sessions
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  size="large"
                  sx={{
                    minWidth: { xs: '100%', sm: 'auto' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Add New
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Paper sx={{ mb: 2, p: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography variant="body2" sx={{ mr: 1 }}>Filter:</Typography>
              <Chip
                label="All"
                onClick={() => setFilter('all')}
                color={filter === 'all' ? 'primary' : 'default'}
                variant={filter === 'all' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={typeIcons.idea}
                label="Ideas"
                onClick={() => setFilter('idea')}
                color={filter === 'idea' ? 'warning' : 'default'}
                variant={filter === 'idea' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={typeIcons.note}
                label="Notes"
                onClick={() => setFilter('note')}
                color={filter === 'note' ? 'info' : 'default'}
                variant={filter === 'note' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={typeIcons.link}
                label="Links"
                onClick={() => setFilter('link')}
                color={filter === 'link' ? 'primary' : 'default'}
                variant={filter === 'link' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={typeIcons.file}
                label="Files"
                onClick={() => setFilter('file')}
                color={filter === 'file' ? 'success' : 'default'}
                variant={filter === 'file' ? 'filled' : 'outlined'}
              />
            </Stack>
          </Paper>

          {documents.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Uploaded Documents
                </Typography>
                {loadingDocs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
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
                                borderColor: 'primary.main',
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
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
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
                                  onClick={() => handleDeleteDocument(doc.id)}
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
              </CardContent>
            </Card>
          )}

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No items captured yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start by adding your first idea, note, or document
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: `${typeColors[item.type]}.lighter`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: `${typeColors[item.type]}.main`,
                          }}
                        >
                          {typeIcons[item.type]}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {item.title}
                          </Typography>
                          {item.content && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {item.content}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} alignItems="center">
                            {item.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                              {item.updated_at.toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => handleOpenDialog(item)} size="small">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.id)} size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </CenteredFlexBox>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CaptureItem['type'] })}
              >
                <MenuItem value="idea">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {typeIcons.idea}
                    <span>Idea</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="note">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {typeIcons.note}
                    <span>Note</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="link">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {typeIcons.link}
                    <span>Link</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="file">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {typeIcons.file}
                    <span>File Reference</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            {formData.type === 'file' ? (
              <Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mb: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Choose File'}
                </Button>
                <TextField
                  label="Description (optional)"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Add a description for this file..."
                />
              </Box>
            ) : (
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={
                  formData.type === 'link'
                    ? 'Enter the URL or link reference'
                    : 'Enter your content here...'
                }
              />
            )}

            <TextField
              label="Tags"
              fullWidth
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Enter tags separated by commas (e.g., workshop, brainstorm, mvp)"
              helperText="Separate multiple tags with commas"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={uploading ? <CircularProgress size={20} /> : <Save />}
            disabled={uploading || (formData.type === 'file' && !selectedFile)}
          >
            {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Capture;