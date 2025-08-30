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
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  QuestionAnswer as QuestionAnswerIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Request } from '@/types/supabase';

interface RequestListProps {
  requests: Request[];
  onMarkAsRead: (request: Request) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  onMarkAsRead,
  onDelete,
  loading = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = React.useState<Request | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, request: Request) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleMarkAsRead = () => {
    if (selectedRequest && !selectedRequest.readAt) {
      onMarkAsRead(selectedRequest);
      handleCloseMenu();
    }
  };

  const handleDelete = () => {
    if (selectedRequest) {
      onDelete(selectedRequest.id);
      handleCloseMenu();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography variant="body1" color="textSecondary">
          Loading requests...
        </Typography>
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', px: 3, pt: 3 }}>
        <Typography variant="body1" color="textSecondary">
          No requests available
        </Typography>
      </Box>
    );
  }

  // Sort requests by date (newest first)
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Request</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRequests.map((request) => (
              <TableRow
                key={request.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  backgroundColor: request.readAt ? undefined : 'rgba(25, 118, 210, 0.04)',
                }}
              >
                <TableCell>
                  <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}>
                    <QuestionAnswerIcon />
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">{request.comment}</Typography>
                </TableCell>
                <TableCell>
                  {request.readAt ? (
                    <Chip label="Read" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                  ) : (
                    <Chip
                      label="Unread"
                      size="small"
                      sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}
                    />
                  )}
                </TableCell>
                <TableCell>{format(new Date(request.publishedAt), 'MMM dd, yyyy')}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleOpenMenu(e, request)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {selectedRequest && !selectedRequest.readAt && (
          <MenuItem onClick={handleMarkAsRead}>
            <MarkEmailReadIcon fontSize="small" sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default RequestList;
