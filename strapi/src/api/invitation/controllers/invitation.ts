import { factories } from '@strapi/strapi';
import crypto from 'crypto';
import emailTemplates from '../../../extensions/email';

export default factories.createCoreController('api::invitation.invitation', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration date (e.g., 7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation with pending status
    const invitation = await strapi.documents('api::invitation.invitation').create({
      data: {
        ...data,
        token,
        invitationStatus: 'pending',
        expiresAt,
      },
    });

    // Send invitation email without querying for related entities
    try {
      const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;
      const currentYear = new Date().getFullYear().toString();

      // Use the data from the request directly
      const startupName = data.startupName || 'a startup';
      const inviterName = data.inviterName || 'Someone';

      const emailHtml = await emailTemplates.getEmailTemplate('invitation', {
        inviterName,
        startupName,
        invitationLink,
        expirationDate: expiresAt.toLocaleDateString(),
        currentYear,
      });

      await strapi.plugins.email.services.email.send({
        to: data.email,
        subject: `Invitation to join ${startupName}`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Error sending invitation email:', error);
    }

    return { data: invitation };
  },

  async resend(ctx) {
    const { id } = ctx.params;

    // Find the invitation
    const invitation = await strapi.db.query('api::invitation.invitation').findOne({
      where: { documentId: id },
      populate: {
        startup: true,
        invitedBy: true,
      },
    });

    if (!invitation) {
      return ctx.notFound('Invitation not found');
    }

    // Check if invitation is still pending
    if (invitation.invitationStatus !== 'pending') {
      return ctx.badRequest('Invitation is no longer pending');
    }

    // Create temporary objects with type assertions to satisfy TypeScript
    const invitationData = invitation as any;

    // Send invitation email again
    try {
      // Get the email template
      const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationData.token}`;
      const currentYear = new Date().getFullYear().toString();

      const emailHtml = await emailTemplates.getEmailTemplate('invitation-reminder', {
        inviterName: invitationData.invitedBy?.username,
        startupName: invitationData.startup?.name,
        invitationLink,
        expirationDate: new Date(invitationData.expiresAt).toLocaleDateString(),
        currentYear,
      });

      await strapi.plugins.email.services.email.send({
        to: invitationData.email,
        subject: `Reminder: Invitation to join ${invitationData.startup?.name}`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return ctx.badRequest('Failed to send invitation email');
    }

    return { data: invitation };
  },

  async accept(ctx) {
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
    const updatedInvitation = await strapi.documents('api::invitation.invitation').update({
      documentId: invitation.documentId,

      data: {
        invitationStatus: 'accepted',
      } as any
    });

    // Add the startup to the user's startups
    await strapi.documents('plugin::users-permissions.user').update({
      documentId: user.documentId,

      data: {
        startups: {
          connect: [invitation.startup.id],
        },
      } as any
    });

    return { data: updatedInvitation };
  },
}));
