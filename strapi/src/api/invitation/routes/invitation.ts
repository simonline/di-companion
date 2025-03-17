import { factories } from '@strapi/strapi';

/**
 * invitation router
 */

// Create the default CRUD routes
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
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/invitations/accept',
      handler: 'invitation.accept',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

// Merge routes
export default {
  routes: [
    ...defaultRouter.routes,
    ...customRoutes.routes,
  ],
};
