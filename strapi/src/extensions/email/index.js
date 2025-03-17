const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

/**
 * Email template helper
 */
module.exports = {
    /**
     * Get email template content
     * @param {string} templateName - The name of the template
     * @param {Object} data - Data to replace in the template
     * @returns {Promise<string>} - The email content
     */
    async getEmailTemplate(templateName, data = {}) {
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
