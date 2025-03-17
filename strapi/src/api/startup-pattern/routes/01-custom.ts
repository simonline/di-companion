export default {
  routes: [
    {
      method: 'GET',
      path: '/startup-patterns/latest',
      handler: 'api::startup-pattern.custom.findLatest',
      config: {
        auth: false,
      }
    }
  ]
}
