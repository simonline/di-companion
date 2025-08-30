import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  Menu,
  MenuItem,
  Paper,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { getRecommendationIcon } from '@/pages/Coach/types';
import { Recommendation } from '@/types/supabase';
import { format } from 'date-fns';

interface RecommendationListProps {
  recommendations: Recommendation[];
  onEdit: (recommendation: Recommendation) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRecommendation, setSelectedRecommendation] = React.useState<Recommendation | null>(
    null,
  );

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, recommendation: Recommendation) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecommendation(recommendation);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRecommendation(null);
  };

  const handleEdit = () => {
    if (selectedRecommendation) {
      onEdit(selectedRecommendation);
      handleCloseMenu();
    }
  };

  const handleDelete = () => {
    if (selectedRecommendation) {
      onDelete(selectedRecommendation.id);
      handleCloseMenu();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', px: 3, pt: 3 }}>
        <Typography variant="body1" color="textSecondary">
          No recommendations available
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Recommendation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recommendations.map((recommendation) => (
              <TableRow
                key={recommendation.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: recommendation.readAt ? undefined : 'rgba(25, 118, 210, 0.04)',
                }}
              >
                <TableCell>
                  <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}>
                    {getRecommendationIcon(recommendation.type)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">{recommendation.comment}</Typography>
                </TableCell>
                <TableCell>
                  {recommendation.readAt ? (
                    <Chip label="Read" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                  ) : (
                    <Chip
                      label="Unread"
                      size="small"
                      sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(recommendation.publishedAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleOpenMenu(e, recommendation)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default RecommendationList;
