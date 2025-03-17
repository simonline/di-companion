import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

/**
 * Email template helper
 */
const emailTemplates = {
  /**
   * Get email template content
   * @param {string} templateName - The name of the template
   * @param {Record<string, string>} data - Data to replace in the template
   * @returns {Promise<string>} - The email content
   */
  async getEmailTemplate(templateName: string, data: Record<string, string> = {}): Promise<string> {
    try {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
      let template = await readFile(templatePath, 'utf8');

      // Replace variables in the template
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key]);
      });

      return template;
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      throw error;
    }
  }
};

export default emailTemplates;
