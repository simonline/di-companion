export default ({ env }: { env: (key: string, defaultValue?: any) => any }) => ({
    email: {
        config: {
            provider: 'nodemailer',
            providerOptions: {
                host: env('SMTP_HOST', 'localhost'),
                port: env('SMTP_PORT', 1025),
                auth: {
                    user: env('SMTP_USERNAME', 'user'),
                    pass: env('SMTP_PASSWORD', 'password'),
                },
            },
            settings: {
                defaultFrom: env('SMTP_FROM', 'hello@example.com'),
                defaultReplyTo: env('SMTP_REPLY_TO', 'hello@example.com'),
            },
        },
    },
});