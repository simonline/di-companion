import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
} from '@mui/material';
import { Close, Refresh, Check } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pattern } from '@/types/strapi';
import {
  categoryDisplayNames,
  categoryColors,
  categoryIcons,
  phaseDisplayNames,
} from '@/utils/constants';

interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  actions: Array<{
    label: string;
    onClick: () => void;
  }>;
}

const ActionDialog: React.FC<ActionDialogProps> = ({ open, onClose, title, actions }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <div className="flex flex-col gap-2 py-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            fullWidth
            variant="contained"
            onClick={() => {
              action.onClick();
              onClose();
            }}
            sx={{ mt: 1 }}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Back</Button>
    </DialogActions>
  </Dialog>
);

interface PatternCardProps {
  pattern: Pattern;
  onNext: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, onNext }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<{
    title: string;
    actions: Array<{ label: string; onClick: () => void }>;
  }>({ title: '', actions: [] });

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setDialogConfig({
        title: 'Why are you passing?',
        actions: [
          { label: 'Already addressed', onClick: () => handleResponse('already_addressed') },
          { label: 'Maybe later', onClick: () => handleResponse('maybe_later') },
          { label: "Can't see value", onClick: () => handleResponse('no_value') },
          { label: "Don't get it", onClick: () => handleResponse('dont_understand') },
        ],
      });
    } else {
      setDialogConfig({
        title: 'Great! What would you like to do?',
        actions: [
          { label: 'Share reflection', onClick: () => handleResponse('share_reflection') },
          { label: 'Perform exercise', onClick: () => handleResponse('perform_exercise') },
          { label: 'Think about it later', onClick: () => handleResponse('think_later') },
        ],
      });
    }
    setDialogOpen(true);
  };

  const handleResponse = (response: string) => {
    console.log('Pattern response:', response);
    onNext();
  };

  const cardFront = (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        borderRadius: '16px',
        backfaceVisibility: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      <Box
        sx={{
          bgcolor: categoryColors[pattern.categories[0]] || '#grey',
          p: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="white">
          {categoryDisplayNames[pattern.categories[0]]}
        </Typography>
        <Typography variant="h5" color="white">
          {categoryIcons[pattern.categories[0]]}
        </Typography>
      </Box>
      <CardMedia
        sx={{
          height: '200px',
          overflow: 'hidden',
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
        }}
      >
        <img
          src={pattern.image && `https://api.di.sce.de${pattern.image?.url}`}
          alt={pattern.name}
        />
      </CardMedia>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          {pattern.name}
        </Typography>
        {pattern.relatedPatterns && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '80px',
              display: 'flex',
              flexDirection: 'row',
              columnGap: 1,
              rowGap: 0.1,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="body2">Related Patterns:</Typography>
            {pattern.relatedPatterns.map((relPattern, index) => (
              <>
                <Typography
                  key={relPattern.name}
                  component="a"
                  variant="body2"
                  href="#"
                  mx="0"
                  sx={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {relPattern.name}
                </Typography>
                {index !== pattern.relatedPatterns.length - 1 && (
                  <Typography variant="body2">-</Typography>
                )}
              </>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
  const cardBack = (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        backfaceVisibility: 'hidden',
        borderRadius: '16px',
        transform: 'rotateY(180deg)',
      }}
    >
      <Box
        sx={{
          bgcolor: categoryColors[pattern.categories[0]] || '#grey',
          p: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="white">
          {categoryDisplayNames[pattern.categories[0]]}
        </Typography>
        <Typography variant="h5" color="white">
          {categoryIcons[pattern.categories[0]]}
        </Typography>
      </Box>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {pattern.name}
        </Typography>
        <Typography variant="body1">{pattern.description}</Typography>
        <Box
          sx={{
            position: 'absolute',
            bottom: '80px',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mt={2}>
            <Stack direction="row" spacing={0.5}>
              {pattern.phases.map((phase) => (
                <Chip
                  key={phase}
                  label={phaseDisplayNames[phase]}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        perspective: '1000px',
        height: '100%',
        maxWidth: '100%',
        aspectRatio: '2/3',
        mx: 'auto',
        position: 'relative',
      }}
    >
      <AnimatePresence>
        <motion.div
          key={pattern.documentId}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            perspective: 1000,
            transformStyle: 'preserve-3d',
            width: '100%',
            position: 'relative',
            height: '100%',
          }}
        >
          {cardFront}
          {cardBack}
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          px: 2,
          zIndex: 1,
        }}
      >
        <IconButton color="error" onClick={() => handleSwipe('left')} size="large">
          <Close />
        </IconButton>
        <IconButton onClick={() => setIsFlipped(!isFlipped)} size="large">
          <Refresh />
        </IconButton>
        <IconButton color="success" onClick={() => handleSwipe('right')} size="large">
          <Check />
        </IconButton>
      </Box>

      <ActionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogConfig.title}
        actions={dialogConfig.actions}
      />
    </Box>
  );
};

export default PatternCard;
