import { factories } from '@strapi/strapi';

/**
 * invitation router
 */

// Create the default router for CRUD operations
const defaultRouter = factories.createCoreRouter('api::invitation.invitation');

// Create custom routes
const customRoutes = {
  routes: [
    {
      method: 'POST',
      path: '/invitations/:id/resend',
      handler: 'invitation.resend',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/invitations/accept',
      handler: 'invitation.accept',
      config: {
        policies: [],
      },
    },
  ],
};

// Merge default and custom routes
export default {
  routes: [
    // Ensure defaultRouter.routes is an array before spreading
    ...(Array.isArray(defaultRouter.routes)
      ? defaultRouter.routes
      : typeof defaultRouter.routes === 'function'
        ? defaultRouter.routes()
        : []),
    ...customRoutes.routes,
  ],
};
