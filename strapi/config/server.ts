export default ({ env }) => ({
  url: env('URL', 'https://api.di.sce.de'),
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
