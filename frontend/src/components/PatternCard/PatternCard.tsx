import React, { useEffect } from 'react';
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
  Tooltip,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { Close, Refresh, Check, Help } from '@mui/icons-material';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { type Pattern, ResponseTypeEnum, ResponseEnum } from '@/types/supabase';
import {
  categoryDisplayNames,
  categoryColors,
  categoryIcons,
  phaseNumbers,
  phaseDisplayNames,
  PhaseEnum,
  CategoryEnum,
} from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import useStartupPattern from '@/hooks/useStartupPattern';
import { useAuthContext } from '@/hooks/useAuth';
import useRequests from '@/hooks/useRequests';
import useNotifications from '@/store/notifications';
import { useCurrentPattern } from '@/hooks/useCurrentPattern';
import { useChatContext } from '@/components/Chat/ChatContext';

interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  pattern: Pattern;
  responseType: ResponseTypeEnum;
  title: string;
  actions: [string, ResponseEnum][];
  onComplete?: () => void;
  nextUrl?: string;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
  open,
  onClose,
  pattern,
  responseType,
  title,
  actions,
  onComplete,
  nextUrl,
}) => {
  const { startup, user } = useAuthContext();
  const navigate = useNavigate();
  const { createStartupPattern, startupPattern } = useStartupPattern();
  const { createRequest } = useRequests();
  const [, notificationsActions] = useNotifications();
  const [response, setResponse] = React.useState<ResponseEnum | null>(null);

  useEffect(() => {
    if (response) {
      createStartupPattern({
        startup: { set: { id: startup?.id as string } },
        pattern: { set: { id: pattern.id } },
        user: { set: { id: user?.id as string } },
        responseType,
        response,
      });
    }
  }, [response, createStartupPattern, pattern, responseType, startup]);

  useEffect(() => {
    if (response && startupPattern) {
      if (responseType === ResponseTypeEnum.accept) {
        switch (response) {
          case ResponseEnum.share_reflection:
            navigate(`/progress/${pattern.id}/survey`, { state: { nextUrl: nextUrl || '/explore' } });
            return;
          case ResponseEnum.perform_exercise:
            navigate(`/progress/${pattern.id}/methods`, {
              state: { nextUrl: `/progress/${pattern.id}/survey?nextUrl=${nextUrl || '/explore'}` }
            });
            return;
          case ResponseEnum.think_later:
            break;
          default:
            break;
        }
      } else if (responseType === ResponseTypeEnum.reject) {
        switch (response) {
          case ResponseEnum.already_addressed:
            break;
          case ResponseEnum.maybe_later:
            break;
          case ResponseEnum.no_value:
            if (startup?.id) {
              createRequest({
                startup: { id: startup.id },
                comment: `I don't see value in the pattern: ${pattern.name}`,
              });
              notificationsActions.push({
                options: { variant: 'success' },
                message: 'Request sent to your coach',
              });
            }
            break;
          case ResponseEnum.dont_understand:
            if (startup?.id) {
              createRequest({
                startup: { id: startup.id },
                comment: `I don't understand the pattern: ${pattern.name}`,
              });
              notificationsActions.push({
                options: { variant: 'success' },
                message: 'Request sent to your coach',
              });
            }
            break;
          default:
            break;
        }
      }

      console.log('onComplete1', onComplete);
      if (onComplete) {
        console.log('onComplete');
        onComplete();
      }
    }
  }, [response, startupPattern, navigate, pattern, responseType, startup, createRequest, notificationsActions, onComplete]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-2 py-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              fullWidth
              variant="contained"
              color={responseType === ResponseTypeEnum.accept ? 'success' : 'error'}
              onClick={() => {
                setResponse(action[1]);
                onClose();
              }}
              sx={{ mt: 1 }}
            >
              {action[0]}
            </Button>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Back</Button>
      </DialogActions>
    </Dialog>
  );
};

interface PatternCardProps {
  pattern: Pattern;
  isInteractive?: boolean;
  onComplete?: () => void;
  nextUrl?: string;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, isInteractive = true, onComplete, nextUrl }) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<{
    responseType: ResponseTypeEnum;
    title: string;
    actions: [string, ResponseEnum][];
  }>({ responseType: ResponseTypeEnum.accept, title: '', actions: [] });
  const [isVisible, setIsVisible] = React.useState(true);
  const [exitDirection, setExitDirection] = React.useState<'left' | 'right' | null>(null);
  const { setCurrentPattern } = useCurrentPattern();
  const { startup, user } = useAuthContext();
  const { sendProgrammaticMessage } = useChatContext();

  // Set the current pattern when the pattern prop changes
  useEffect(() => {
    setCurrentPattern(pattern);
  }, [pattern, setCurrentPattern]);

  const handleSwipe = (direction: 'left' | 'right') => {
    setExitDirection(direction);
    setIsVisible(false);

    // Delay dialog opening until after exit animation
    setTimeout(() => {
      if (direction === 'right') {
        setDialogConfig({
          responseType: ResponseTypeEnum.accept,
          title: 'Great! What would you like to do?',
          actions: [
            ['Explore methods', ResponseEnum.perform_exercise],
            ['Share reflection', ResponseEnum.share_reflection],
            ['Think about it later', ResponseEnum.think_later],
          ],
        });
      } else {
        setDialogConfig({
          responseType: ResponseTypeEnum.reject,
          title: 'Why are you passing?',
          actions: [
            ['Already addressed', ResponseEnum.already_addressed],
            ['Maybe later', ResponseEnum.maybe_later],
            ["Can't see value", ResponseEnum.no_value],
            ["Don't get it", ResponseEnum.dont_understand],
          ],
        });
      }
      setDialogOpen(true);
    }, 100); // Match this with animation duration
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isInteractive) return;

    const SWIPE_THRESHOLD = 100;

    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      // Determine swipe direction and trigger exit
      const direction = info.offset.x > 0 ? 'right' : 'left';
      handleSwipe(direction);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setExitDirection(null);
    setIsVisible(true);
    setIsFlipped(false);
  };

  const handleAgentHelp = async () => {

    try {
      // Create a comprehensive prompt with pattern and startup information
      const startupInfo = startup ? `
Startup Context:
- Name: ${startup.name}
- Industry: ${startup.industry}${startup.industryOther ? ` (${startup.industryOther})` : ''}
- Target Market: ${startup.targetMarket}
- Product Type: ${startup.productType}
- Phase: ${startup.phase}
- Background: ${startup.background}
- Idea: ${startup.idea}
- Target Market: ${startup.targetMarket}
- Problem Validated: ${startup.isProblemValidated ? 'Yes' : 'No'}
- Target Group Defined: ${startup.isTargetGroupDefined ? 'Yes' : 'No'}
- Prototype Validated: ${startup.isPrototypeValidated ? 'Yes' : 'No'}
- MVP Tested: ${startup.isMvpTested ? 'Yes' : 'No'}
- Qualified Conversations: ${startup.qualifiedConversationsCount || 0}
- Founders Count: ${startup.foundersCount}
- Start Date: ${startup.startDate}
` : 'No startup information available';

      const patternInfo = `
Pattern Information:
- Name: ${pattern.name}
- Category: ${categoryDisplayNames[pattern.category as CategoryEnum]}
- Subcategory: ${pattern.subcategory}
- Description: ${pattern.description}
- Phases: ${pattern.phases.map(phase => phaseDisplayNames[phase as PhaseEnum]).join(', ')}
- Pattern ID: ${pattern.patternId}
`;

      const userPrompt = `I need help understanding and implementing the "${pattern.name}" pattern. Can you provide clear, actionable guidance?`;

      const systemPrompt = `You are a startup coach expert who provides clear, actionable guidance. Focus on practical implementation steps and avoid jargon. Be encouraging and supportive while being direct and helpful.

${patternInfo}

${startupInfo}

Please provide:
1. A simple explanation of what this pattern means in practical terms
2. Why this pattern is important for a startup like mine
3. Step-by-step instructions on how to implement this pattern
4. Common mistakes to avoid
5. How to measure success with this pattern
6. Any tools or resources that would help with implementation

Make your response actionable and easy to follow.`;

      // Send the message using the chat context
      await sendProgrammaticMessage(userPrompt, systemPrompt);

    } catch (error) {
      console.error('Error sending message to agent:', error);
      // You could show a notification here if needed
    }
  };

  const cardHeader = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          bgcolor: categoryColors[pattern.category as CategoryEnum] || '#grey',
          padding: { xs: '8px 16px', sm: '16px 32px' },
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            flex: 1,
            mr: { xs: 2, sm: 0 },
            gap: { xs: 1, sm: 0 },
            minWidth: 0,
          }}
        >
          <Typography
            variant="h6"
            color="white"
            fontSize="1em"
            lineHeight="1.1em"
            fontWeight="bold"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {categoryDisplayNames[pattern.category as CategoryEnum]}
          </Typography>
          <Typography
            variant="h6"
            color="white"
            fontSize="1em"
            lineHeight="1.1em"
            sx={{
              display: { xs: 'none', sm: 'block' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {pattern.subcategory}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            ml: { xs: 1, sm: 2 },
          }}
        >
          <img
            src={categoryIcons[pattern.category as CategoryEnum]}
            alt={''}
            height={40}
            style={{
              height: 'clamp(30px, 5vw, 40px)',
              width: 'auto',
            }}
          />
        </Box>
      </Box>
    </Box>
  );

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
        overflow: 'visible',
      }}
    >
      {cardHeader}
      <CardMedia
        sx={{
          height: '30%',
          overflow: 'hidden',
          bgcolor: 'grey.100',
          position: 'relative',
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
        }}
      >
        {pattern.image ? (
          <img src={`${import.meta.env.VITE_API_URL}${pattern.image.url}`} alt={''} />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon
              sx={{
                fontSize: 48,
                color: 'grey.300',
              }}
            />
          </Box>
        )}
      </CardMedia>
      <CardContent
        sx={{
          display: 'flex',
          padding: { xs: 2, sm: 4 },
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          fontSize="1.8em"
          fontWeight="900"
          lineHeight="1.1em"
          color={categoryColors[pattern.category as CategoryEnum]}
          sx={{ flex: 1 }}
          marginBottom={{ xs: '.5em', sm: '2em' }}
        >
          {pattern.name}
        </Typography>
        {pattern.relatedPatterns && (
          <Box
            sx={{
              flex: 1,
            }}
          >
            <Typography variant="body2" fontWeight="900" textTransform="uppercase" fontSize="1em">
              Related Patterns
            </Typography>
            <Box
              sx={{
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                display: '-webkit-box',
              }}
            >
              {pattern.relatedPatterns.map((relPattern, index) => (
                <React.Fragment key={relPattern.name}>
                  <Typography
                    component="a"
                    variant="body2"
                    onClick={() => navigate(`/explore/${relPattern.id}`)}
                    color="black"
                    lineHeight="1.2em"
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'inline',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {relPattern.name}
                  </Typography>
                  {index !== pattern.relatedPatterns.length - 1 && (
                    <Typography variant="body2" lineHeight="1.2em" sx={{ display: 'inline' }}>
                      {' '}
                      –{' '}
                    </Typography>
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        )}
        <Box sx={{ position: 'absolute', bottom: '70px', right: '40px' }}>
          <Chip
            size="small"
            label={pattern.patternId}
            variant="outlined"
            sx={{
              fontWeight: 'bold',
              fontSize: '1em',
              paddingX: 1,
            }}
          />
        </Box>
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
      {cardHeader}
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: { xs: '.5em', sm: '2em' },
        }}
      >
        <Typography
          variant="h3"
          fontSize="1.8em"
          fontWeight="900"
          lineHeight="1.1em"
          color={categoryColors[pattern.category as CategoryEnum]}
          marginBottom={{ xs: '.2em', sm: '.8em' }}
        >
          {pattern.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {pattern.description}
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            bottom: '80px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography
              variant="body2"
              fontWeight="900"
              textTransform="uppercase"
              fontSize="1em"
              paddingTop="0.3em"
              paddingRight=".3em"
            >
              Phases
            </Typography>
            {Object.entries(phaseNumbers).map(([phase, number]) => (
              <Tooltip key={number} title={phaseDisplayNames[phase]}>
                <Chip
                  label={number}
                  sx={{
                    backgroundColor: pattern.phases.includes(phase as PhaseEnum)
                      ? '#918d73'
                      : '#cccdcc',
                    color: 'white',
                    fontWeight: '900',
                    fontSize: '1.2em',
                    borderRadius: '50%',
                    height: '1.5em',
                    width: '1.5em',
                    padding: 0,
                    span: {
                      padding: 0,
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
          <Tooltip title="Get help understanding this pattern">
            <Button
              variant="contained"
              startIcon={<Help />}
              onClick={handleAgentHelp}
              size="small"
              sx={{
                backgroundColor: categoryColors[pattern.category as CategoryEnum],
                color: 'white',
                '&:hover': {
                  backgroundColor: categoryColors[pattern.category as CategoryEnum],
                  opacity: 0.9,
                },
              }}
            >
              Get Help
            </Button>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

  const variants = {
    enter: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -1000 : 1000,
      opacity: 0,
      scale: 0.5,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  const cardContainer = isVisible && (
    <motion.div
      key="card-container"
      initial="enter"
      animate="center"
      exit="exit"
      variants={variants}
      custom={exitDirection}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {cardFront}
        {cardBack}
      </motion.div>
    </motion.div>
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
        touchAction: isInteractive ? 'pan-y' : 'none',
      }}
    >
      <AnimatePresence mode="wait" custom={exitDirection}>
        {cardContainer}
      </AnimatePresence>

      {/* Only show buttons if card is visible and interactive */}
      {isVisible && isInteractive && (
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
      )}

      {/* Only show dialog if interactive */}
      {isInteractive && (
        <ActionDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          pattern={pattern}
          responseType={dialogConfig.responseType}
          title={dialogConfig.title}
          actions={dialogConfig.actions}
          onComplete={onComplete}
          nextUrl={nextUrl}
        />
      )}
    </Box>
  );
};

export default PatternCard;
