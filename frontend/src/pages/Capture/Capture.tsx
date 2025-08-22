import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
} from '@mui/material';
import {
  Save,
  Delete,
  Edit,
  Add,
  LightbulbOutlined,
  DescriptionOutlined,
  LinkOutlined,
  ImageOutlined,
  AttachFile,
  Close,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';

interface CaptureItem {
  id: string;
  type: 'idea' | 'note' | 'link' | 'file';
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
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
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<CaptureItem | null>(null);
  const [formData, setFormData] = useState({
    type: 'idea' as CaptureItem['type'],
    title: '',
    content: '',
    tags: '',
  });
  const [filter, setFilter] = useState<'all' | CaptureItem['type']>('all');

  useEffect(() => {
    const savedItems = localStorage.getItem(`capture_items_${user?.id}`);
    if (savedItems) {
      setItems(JSON.parse(savedItems).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })));
    }
  }, [user?.id]);

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
    setFormData({
      type: 'idea',
      title: '',
      content: '',
      tags: '',
    });
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      notificationActions.push({ message: 'Title is required', options: { variant: 'error' } });
      return;
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
      createdAt: editingItem?.createdAt || new Date(),
      updatedAt: new Date(),
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

  const handleDelete = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    saveItems(updatedItems);
    notificationActions.push({ message: 'Item deleted successfully', options: { variant: 'success' } });
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.type === filter);

  return (
    <>
      <Header title="Add your content" />
      <CenteredFlexBox>
        <Box sx={{ maxWidth: 1200, width: '100%', px: 2 }}>
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
                    Save ideas, notes, links, and documents from your workshops and brainstorming sessions
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
                              {item.updatedAt.toLocaleDateString()}
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
                  : formData.type === 'file'
                  ? 'Enter file name or reference'
                  : 'Enter your content here...'
              }
            />

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
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            {editingItem ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Capture;