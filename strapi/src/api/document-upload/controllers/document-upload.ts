/**
 * document-upload controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::document-upload.document-upload', ({ strapi }) => ({
  async find(ctx) {
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view documents');
    }

    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        user: user.id
      }
    };

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view this document');
    }

    const entity = await strapi.service('api::document-upload.document-upload').findOne(id, {
      populate: ['file', 'user', 'startup']
    });

    if (!entity) {
      return ctx.notFound('Document not found');
    }

    if (entity.user.id !== user.id) {
      return ctx.forbidden('You do not have permission to view this document');
    }

    return entity;
  },

  async create(ctx) {
    const { user } = ctx.state;

    if (!user) {
      return ctx.unauthorized('You must be logged in to upload documents');
    }

    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id
    };

    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update this document');
    }

    const entity = await strapi.service('api::document-upload.document-upload').findOne(id, {
      populate: ['user']
    });

    if (!entity) {
      return ctx.notFound('Document not found');
    }

    if (entity.user.id !== user.id) {
      return ctx.forbidden('You do not have permission to update this document');
    }

    const response = await super.update(ctx);
    return response;
  },

  async delete(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to delete this document');
    }

    const entity = await strapi.service('api::document-upload.document-upload').findOne(id, {
      populate: ['user']
    });

    if (!entity) {
      return ctx.notFound('Document not found');
    }

    if (entity.user.id !== user.id) {
      return ctx.forbidden('You do not have permission to delete this document');
    }

    const response = await super.delete(ctx);
    return response;
  }
}));