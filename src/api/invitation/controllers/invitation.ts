import { factories } from '@strapi/strapi';
import crypto from 'crypto';
import emailTemplates from '../../../extensions/email';

// Use the StrapiContext type from our custom type definitions
interface StrapiContext {
  state: {
    user?: any;
  };
  request: {
    body: any;
    query: any;
    params: any;
  };
  params: any;
  notFound(message?: string): any;
  badRequest(message?: string): any;
  unauthorized(message?: string): any;
  forbidden(message?: string): any;
}

export default factories.createCoreController('api::invitation.invitation', ({ strapi }) => ({
  async create(ctx: StrapiContext) {
    const { data } = ctx.request.body;

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration date (e.g., 7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation with pending status
    const invitation = await strapi.entityService.create('api::invitation.invitation', {
      data: {
        ...data,
        token,
        invitationStatus: 'pending',
        expiresAt,
      },
    });

    // Get startup and user details for the email
    const startup = await strapi.entityService.findOne(
      'api::startup.startup',
      data.startup.set.documentId,
    );
    const invitedBy = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      data.invitedBy.set.documentId,
    );

    // Send invitation email
    try {
      // Get the email template
      const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;
      const currentYear = new Date().getFullYear().toString();

      const emailHtml = await emailTemplates.getEmailTemplate('invitation', {
        inviterName: invitedBy.username,
        startupName: startup.name,
        invitationLink,
        expirationDate: expiresAt.toLocaleDateString(),
        currentYear,
      });

      await strapi.plugins.email.services.email.send({
        to: data.email,
        subject: `Invitation to join ${startup.name}`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Error sending invitation email:', error);
    }

    return { data: invitation };
  },

  async resend(ctx: StrapiContext) {
    const { id } = ctx.params;

    // Find the invitation
    const invitation = await strapi.entityService.findOne('api::invitation.invitation', id, {
      populate: ['startup', 'invitedBy'],
    });

    if (!invitation) {
      return ctx.notFound('Invitation not found');
    }

    // Check if invitation is still pending
    if (invitation.invitationStatus !== 'pending') {
      return ctx.badRequest('Invitation is no longer pending');
    }

    // Send invitation email again
    try {
      // Get the email template
      const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitation.token}`;
      const currentYear = new Date().getFullYear().toString();

      const emailHtml = await emailTemplates.getEmailTemplate('invitation-reminder', {
        inviterName: invitation.invitedBy.username,
        startupName: invitation.startup.name,
        invitationLink,
        expirationDate: new Date(invitation.expiresAt).toLocaleDateString(),
        currentYear,
      });

      await strapi.plugins.email.services.email.send({
        to: invitation.email,
        subject: `Reminder: Invitation to join ${invitation.startup.name}`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return ctx.badRequest('Failed to send invitation email');
    }

    return { data: invitation };
  },

  async accept(ctx: StrapiContext) {
    const { token } = ctx.request.body;

    if (!token) {
      return ctx.badRequest('Token is required');
    }

    // Find the invitation by token
    const invitation = await strapi.db.query('api::invitation.invitation').findOne({
      where: { token },
      populate: ['startup'],
    });

    if (!invitation) {
      return ctx.notFound('Invitation not found');
    }

    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return ctx.badRequest('Invitation has expired');
    }

    // Check if invitation is still pending
    if (invitation.invitationStatus !== 'pending') {
      return ctx.badRequest('Invitation is no longer pending');
    }

    // Get the current user
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to accept an invitation');
    }

    // Update the invitation status
    const updatedInvitation = await strapi.entityService.update(
      'api::invitation.invitation',
      invitation.id,
      {
        data: {
          invitation_status: 'accepted',
        },
      },
    );

    // Add the user to the startup's users
    await strapi.entityService.update('api::startup.startup', invitation.startup.id, {
      data: {
        users_permissions_users: {
          connect: [user.id],
        },
      },
    });

    return { data: updatedInvitation };
  },
}));
