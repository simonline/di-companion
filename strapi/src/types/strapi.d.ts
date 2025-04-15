import { EntityService } from '@strapi/strapi';

declare module '@strapi/strapi' {
    interface User {
        startups?: Array<{
            id: number;
            documentId: string;
        }>;
    }

    interface EntityService {
        findOne<T extends keyof Strapi.CollectionTypes>(
            uid: T,
            id: string | number,
            params?: any
        ): Promise<Strapi.CollectionTypes[T]>;
    }
} 