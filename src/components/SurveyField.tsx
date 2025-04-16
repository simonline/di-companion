import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormHelperText,
  TextField,
  Box,
  IconButton,
  Tooltip,
  Slider,
  Typography,
} from '@mui/material';
import { DragDropContext, Droppable, DroppableProps, Draggable } from 'react-beautiful-dnd';
import { Question, QuestionType, ScaleOptions } from '@/types/strapi';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useAuthContext } from '@/hooks/useAuth';
import useRequests from '@/hooks/useRequests';
import useNotifications from '@/store/notifications';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface SurveyFieldProps {
  question: Question;
  field: any;
  form: any;
}

export const StrictDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};

const HtmlTooltip = ({ title, children }: { title: string; children: React.ReactElement }) => {
  return (
    <Tooltip
      title={
        <Typography
          component="div"
          dangerouslySetInnerHTML={{ __html: title }}
          sx={{
            maxWidth: 300,
            fontSize: '0.875rem',
            lineHeight: 1.5
          }}
        />
      }
      placement="right"
    >
      {children}
    </Tooltip>
  );
};

const SurveyField: React.FC<SurveyFieldProps> = ({ question, field, form }) => {
  const error = form.touched[question.documentId] && form.errors[question.documentId];
  const { startup } = useAuthContext();
  const { createRequest } = useRequests();
  const [, notificationsActions] = useNotifications();

  const handleRequestCoach = async () => {
    if (!startup?.documentId) return;

    try {
      await createRequest({
        startup: { id: startup.documentId },
        comment: `I need help with the question: ${question.question}`,
      });

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Request sent to your coach',
      });
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to send request',
      });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(field.value || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setFieldValue(question.documentId, items);
  };

  // Skip rendering if field is hidden
  if (question.isHidden) {
    return null;
  }

  const commonTextFieldProps = {
    fullWidth: true,
    label:
      question.question +
      (question.isRequired ? ' *' : '') +
      (question.maxLength ? ` (max. ${question.maxLength} characters)` : ''),
    error: !!error,
    helperText: error,
    inputProps: question.maxLength ? { maxLength: question.maxLength } : undefined,
  };

  const renderFieldWithHelp = (fieldComponent: React.ReactNode) => (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {fieldComponent}
      {question.helpText && (
        <HtmlTooltip title={question.helpText}>
          <IconButton size="small" sx={{ ml: 1 }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </HtmlTooltip>
      )}
      {question.showRequestCoach && (
        <Tooltip title="Ask your coach for help" placement="right">
          <IconButton size="small" onClick={handleRequestCoach} sx={{ ml: 1 }}>
            <QuestionAnswerIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  switch (question.type) {
    case QuestionType.radio:
      return (
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormLabel component="legend">
            {question.question + (question.isRequired ? ' *' : '')}
          </FormLabel>
          <RadioGroup {...field} row>
            {Array.isArray(question.options) &&
              question.options.map(({ value, label }) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio sx={{ p: 0.5 }} />}
                  label={label}
                  sx={{
                    margin: 0,
                    mr: 1,
                  }}
                />
              ))}
          </RadioGroup>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case QuestionType.select:
      return (
        <FormControl fullWidth error={!!error}>
          <FormLabel>{question.question + (question.isRequired ? ' *' : '')}</FormLabel>
          {renderFieldWithHelp(
            <Select {...field} sx={{ width: '100%' }}>
              {Array.isArray(question.options) &&
                question.options.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
            </Select>,
          )}
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case QuestionType.select_multiple:
      return (
        <FormControl fullWidth error={!!error}>
          <FormLabel>{question.question + (question.isRequired ? ' *' : '')}</FormLabel>
          {renderFieldWithHelp(
            <Select
              {...field}
              multiple
              sx={{ width: '100%' }}
              renderValue={(selected: string[]) => {
                if (!Array.isArray(question.options)) return '';
                return selected
                  .map((value: string) => {
                    const option = question.options.find(
                      (opt: QuestionOption) => opt.value === value,
                    );
                    return option?.label || '';
                  })
                  .join(', ');
              }}
            >
              {Array.isArray(question.options) &&
                question.options.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    <Checkbox checked={field.value.includes(value)} />
                    {label}
                  </MenuItem>
                ))}
            </Select>,
          )}
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case QuestionType.checkbox:
      return (
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormGroup>
            {renderFieldWithHelp(
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label={question.question + (question.isRequired ? ' *' : '')}
              />,
            )}
          </FormGroup>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case QuestionType.text_long:
      return renderFieldWithHelp(
        <TextField {...field} {...commonTextFieldProps} multiline rows={4} />,
      );

    case QuestionType.email:
      return renderFieldWithHelp(<TextField {...field} {...commonTextFieldProps} type="email" />);

    case QuestionType.number:
      return renderFieldWithHelp(<TextField {...field} {...commonTextFieldProps} type="number" />);

    case QuestionType.checkbox_multiple:
      return (
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormLabel component="legend">
            {question.question + (question.isRequired ? ' *' : '')}
          </FormLabel>
          {renderFieldWithHelp(
            <FormGroup>
              {Array.isArray(question.options) &&
                question.options.map(({ value, label }) => (
                  <FormControlLabel
                    key={value}
                    control={
                      <Checkbox
                        checked={field.value?.includes(value)}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...(field.value || []), value]
                            : field.value?.filter((v: string) => v !== value);
                          form.setFieldValue(question.documentId, newValue);
                        }}
                      />
                    }
                    label={label}
                  />
                ))}
            </FormGroup>,
          )}
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case QuestionType.rank:
      // Initialize the field value if it's not set
      if ((!field.value || field.value.length === 0) && question.options) {
        const initialValues = question.options.map((opt) => opt.value);
        form.setFieldValue(question.documentId, initialValues);
      }

      return (
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormLabel component="legend">
            {question.question + (question.isRequired ? ' *' : '')}
          </FormLabel>
          {renderFieldWithHelp(
            <DragDropContext onDragEnd={handleDragEnd}>
              <StrictDroppable droppableId={`rank-list-${question.documentId}`}>
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ width: '100%' }}>
                    {(field.value || []).map((value: string, index: number) => {
                      const option = question.options?.find((opt) => opt.value === value);
                      if (!option) {
                        console.warn(`Option not found for value: ${value}`);
                        return null;
                      }

                      return (
                        <Draggable
                          key={`${question.documentId}-${value}`}
                          draggableId={`${question.documentId}-${value}`}
                          index={index}
                        >
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1,
                                mb: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                boxShadow: 1,
                              }}
                            >
                              <DragIndicatorIcon sx={{ mr: 1 }} />
                              <span>{option.label}</span>
                            </Box>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </StrictDroppable>
            </DragDropContext>,
          )}
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case QuestionType.scale: {
      if (
        !question.options ||
        typeof question.options !== 'object' ||
        Array.isArray(question.options)
      ) {
        return null;
      }
      const options = question.options as ScaleOptions;

      return (
        <FormControl component="fieldset" error={!!error} fullWidth>
          <FormLabel component="legend">
            {question.question + (question.isRequired ? ' *' : '')}
          </FormLabel>
          {renderFieldWithHelp(
            <Box sx={{ width: '100%', px: 2, position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  bottom: -20,
                }}
              >
                <span>{options.minLabel}</span>
                <span>{options.maxLabel}</span>
              </Box>
              <Slider
                value={field.value || options.min}
                onChange={(_, value) => form.setFieldValue(question.documentId, value)}
                min={options.min}
                max={options.max}
                valueLabelDisplay="auto"
              />
            </Box>,
          )}
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );
    }

    default: // text_short
      return renderFieldWithHelp(<TextField {...field} {...commonTextFieldProps} />);
  }
};

export default SurveyField;
