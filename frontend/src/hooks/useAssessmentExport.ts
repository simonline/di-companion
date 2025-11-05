import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { generateText, ExportData } from '@/utils/exportAssessment';

/**
 * Hook to generate text export content for assessment pages
 * Returns null if not on an assessment page or if data is not ready
 */
export const useAssessmentExport = (): string | null => {
  const location = useLocation();

  const exportText = useMemo(() => {
    // Detect which assessment page we're on
    const pathname = location.pathname;

    // Check if we're on an assessment page
    const isAssessmentPage =
      pathname.includes('/self-assessment') ||
      pathname.includes('/team-assessment') ||
      pathname.includes('/team-contract') ||
      pathname.includes('/team-values');

    if (!isAssessmentPage) {
      return null;
    }

    // Try to get the export content from the page's current state
    // We'll look for data in the DOM that the page components expose
    try {
      // Look for a data attribute that contains export data
      const exportDataElement = document.querySelector('[data-export-context]');
      if (exportDataElement) {
        const exportDataStr = exportDataElement.getAttribute('data-export-context');
        if (exportDataStr) {
          const exportData: ExportData = JSON.parse(exportDataStr);
          return generateText(exportData);
        }
      }

      // If no export data is available yet, return a basic context
      const pageTitle = document.title;
      const mainContent = document.querySelector('main')?.innerText || '';

      // Return basic page context if we're on an assessment page but data isn't ready
      if (mainContent) {
        return `Current Page: ${pageTitle}\n\nPage Context:\n${mainContent.substring(0, 1000)}`;
      }
    } catch (error) {
      console.error('Error generating assessment export:', error);
    }

    return null;
  }, [location.pathname]);

  return exportText;
};

export default useAssessmentExport;
