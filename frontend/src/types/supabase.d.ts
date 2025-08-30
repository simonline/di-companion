declare module '@supabase/supabase' {
  namespace Supabase {
    interface Factories {
      createCoreController(uid: string, config?: any): any;
      createCoreRouter(uid: string, config?: any): any;
    }

    interface Services {
      email: {
        send(options: { to: string; subject: string; html: string; text?: string }): Promise<any>;
      };
      [key: string]: any;
    }

    interface Plugins {
      email: {
        services: {
          email: {
            send(options: {
              to: string;
              subject: string;
              html: string;
              text?: string;
            }): Promise<any>;
          };
        };
      };
      [key: string]: any;
    }

    interface EntityService {
      findOne(uid: string, id: number | string, params?: any): Promise<any>;
      create(uid: string, params: any): Promise<any>;
      update(uid: string, id: number | string, params: any): Promise<any>;
      delete(uid: string, id: number | string, params?: any): Promise<any>;
      findMany(uid: string, params?: any): Promise<any[]>;
    }

    interface Database {
      query(uid: string): {
        findOne(params: any): Promise<any>;
        findMany(params: any): Promise<any[]>;
        create(params: any): Promise<any>;
        update(params: any): Promise<any>;
        delete(params: any): Promise<any>;
      };
    }

    interface SupabaseContext {
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

    type EnvFunction = (key: string, defaultValue?: any) => any;
  }

  interface Supabase {
    factories: Supabase.Factories;
    plugins: Supabase.Plugins;
    services: Supabase.Services;
    entityService: Supabase.EntityService;
    db: Supabase.Database;
    env: Supabase.EnvFunction;
  }

  export const factories: Supabase.Factories;
}

// Declare the global supabase variable
declare global {
  // eslint-disable-next-line no-var
  var supabase: import('@supabase/supabase').Supabase;
}

export {};
