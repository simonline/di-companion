/**
 * invitation router
 */

// Create a custom router by extending the core router
export default {
  type: 'content-api',
  routes: [
    // Include all default routes
    {
      method: 'GET',
      path: '/invitations',
      handler: 'api::invitation.invitation.find',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/invitations/:id',
      handler: 'api::invitation.invitation.findOne',
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/invitations',
      handler: 'api::invitation.invitation.create',
      config: { policies: [] },
    },
    {
      method: 'PUT',
      path: '/invitations/:id',
      handler: 'api::invitation.invitation.update',
      config: { policies: [] },
    },
    {
      method: 'DELETE',
      path: '/invitations/:id',
      handler: 'api::invitation.invitation.delete',
      config: { policies: [] },
    },
    // Add custom routes
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
