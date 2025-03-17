import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::startup-pattern.startup-pattern', ({ strapi }) => ({
  async findLatest(ctx) {
    try {
      const { data, meta } = await super.find(ctx);
      const patterns = data.map(item => item.attributes);

      // Group the patterns by 'startup' and 'pattern' document IDs
      const groupedPatterns = patterns.reduce((acc, pattern) => {
        const startupId = pattern.startup?.id;
        const patternId = pattern.pattern?.id;

        if (!startupId || !patternId) return acc; // Skip if related IDs are missing

        const groupKey = `${startupId}_${patternId}`;

        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }

        acc[groupKey].push(pattern);
        return acc;
      }, {} as Record<string, typeof patterns>);

      // Optionally, you can transform groupedPatterns into an array or desired structure
      const latestGroupedPatterns = Object.values(groupedPatterns).map(group => group[0]); // Get the latest in each group

      // Return the response
      return this.transformResponse(latestGroupedPatterns);
    } catch (error) {
      // Handle errors
      ctx.throw(500, error);
    }
  },
}));
