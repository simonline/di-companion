/**
 * Custom Users-permissions controller
 */

import { factories } from '@strapi/strapi';

// Define types for query structure
interface StartupFilters {
    documentId?: {
        $eq?: string;
    };
}

interface QueryPopulate {
    startups?: {
        filters?: StartupFilters;
    };
}

interface StrapiQuery {
    populate?: QueryPopulate;
    filters?: Record<string, any>;
}

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
    // Override the find method to filter users based on startup membership
    async find(ctx) {
        // Get the startup filter from the query parameters
        const query = ctx.query as StrapiQuery;
        const startupDocumentId = query?.populate?.startups?.filters?.documentId?.$eq;

        // Get the current user
        const user = ctx.state.user;

        // If there's no startup filter or no user, return unauthorized
        if (!startupDocumentId || !user) {
            return ctx.unauthorized('You must specify a startup and be logged in to view users');
        }

        // Check if the current user belongs to the requested startup
        const currentUserWithStartups = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user.id,
            {
                populate: ['startups'],
            }
        );

        // @ts-expect-error - startups relation exists in schema but not in generated types
        const hasAccess = currentUserWithStartups?.startups?.some(
            (startup) => startup.documentId === startupDocumentId
        );

        if (!hasAccess) {
            return ctx.forbidden('You do not have access to view members of this startup');
        }

        // Only show users who belong to this startup
        ctx.query = {
            ...query,
            filters: {
                ...(query.filters || {}),
                startups: {
                    documentId: {
                        $eq: startupDocumentId,
                    },
                },
            },
        } as any; // Type assertion needed since we're modifying ctx.query

        // Call the original find controller method with the modified query
        return await super.find(ctx);
    },

    // Keep the original findOne method but add startup access check
    async findOne(ctx) {
        const { id } = ctx.params;
        const user = ctx.state.user;

        if (!user) {
            return ctx.unauthorized('You must be logged in to view user details');
        }

        // First get the target user with their startups
        const targetUser = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            id,
            {
                populate: ['startups'],
            }
        );

        if (!targetUser) {
            return ctx.notFound('User not found');
        }

        // Get the current user with their startups
        const currentUserWithStartups = await strapi.entityService.findOne(
            'plugin::users-permissions.user',
            user.id,
            {
                populate: ['startups'],
            }
        );

        // @ts-expect-error - startups relation exists in schema but not in generated types
        const sharedStartups = targetUser.startups?.filter(targetStartup =>
            // @ts-expect-error - startups relation exists in schema but not in generated types
            currentUserWithStartups.startups?.some(
                userStartup => userStartup.id === targetStartup.id
            )
        );

        if (!sharedStartups || sharedStartups.length === 0) {
            return ctx.forbidden('You do not have access to view this user');
        }

        // Continue with the standard findOne method
        return await super.findOne(ctx);
    },
})); 