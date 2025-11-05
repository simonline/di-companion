import { Question, UserQuestion, StartupQuestion } from '@/types/database';

export interface ExportData {
  title: string;
  subtitle?: string;
  sections: Array<{
    heading: string;
    questions: Array<{
      question: string;
      answer: string | string[];
    }>;
  }>;
  metadata?: {
    date: string;
    user?: string;
    startup?: string;
  };
}

/**
 * Format an answer value for display
 */
const formatAnswer = (answer: any): string => {
  if (!answer) return 'Not answered';

  // Handle array answers (multiple choice)
  if (Array.isArray(answer)) {
    if (answer.length === 0) return 'Not answered';
    return answer.join(', ');
  }

  // Handle boolean answers
  if (typeof answer === 'boolean') {
    return answer ? 'Yes' : 'No';
  }

  // Handle number answers (scale, number, etc.)
  if (typeof answer === 'number') {
    return String(answer);
  }

  // Handle string answers
  return String(answer);
};

/**
 * Generate markdown content from assessment data
 */
export const generateText = (data: ExportData): string => {
  let text = `# ${data.title}\n\n`;

  // Add sections
  const showSectionTitles = data.sections.length > 1;

  data.sections.forEach((section) => {
    // Only show section heading if there are multiple sections
    if (showSectionTitles) {
      text += `## ${section.heading}\n\n`;
    }

    section.questions.forEach((item) => {
      text += `### ${item.question}\n\n`;

      if (Array.isArray(item.answer)) {
        item.answer.forEach(ans => {
          text += `- ${ans}\n`;
        });
        text += `\n`;
      } else {
        text += `${item.answer}\n\n`;
      }
    });
  });

  return text;
};

/**
 * Download content as a file
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export assessment as markdown
 */
export const exportAsText = (data: ExportData) => {
  const content = generateText(data);
  const filename = `${data.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
  downloadFile(content, filename, 'text/markdown');
};
