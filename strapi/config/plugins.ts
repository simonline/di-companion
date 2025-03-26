export default ({ env }: { env: (key: string, defaultValue?: any) => any }) => ({
  "users-permissions": {
    config: {
      register: {
        allowedFields: ["givenName", "familyName", "gender", "position", "bio", "linkedinProfile", "phone", "isPhonePublic", "avatar"],
      },
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'noreply@example.com'),
        defaultReplyTo: env('SMTP_REPLY_TO', 'noreply@example.com'),
      },
    },
  },
});
