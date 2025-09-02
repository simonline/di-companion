import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationEmailRequest {
  invitationId: string;
  email: string;
  inviterName: string;
  startupName: string;
  invitationUrl: string;
  expiresAt: string;
}

const getEmailTemplate = (data: {
  inviterName: string;
  startupName: string;
  invitationLink: string;
  expirationDate: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invitation to join ${data.startupName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4a5568; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f7fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #3182ce; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #718096; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited!</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.startupName}</strong> on DI Companion.</p>
          <p>Click the button below to accept the invitation and join the team:</p>
          <div style="text-align: center;">
            <a href="${data.invitationLink}" class="button">Accept Invitation</a>
          </div>
          <p><small>Or copy and paste this link into your browser:</small><br>
          <small>${data.invitationLink}</small></p>
          <p><small>This invitation will expire on ${data.expirationDate}.</small></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} DI Companion. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { invitationId, email, inviterName, startupName, invitationUrl, expiresAt } =
      await req.json() as InvitationEmailRequest;

    // Format expiration date
    const expirationDate = new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate email HTML
    const emailHtml = getEmailTemplate({
      inviterName,
      startupName,
      invitationLink: invitationUrl,
      expirationDate
    });

    // Send email using Resend (or your preferred email service)
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DI Companion <di@sce.de>',
          to: email,
          subject: `Invitation to join ${startupName}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${await response.text()}`);
      }

      // Update invitation to mark email as sent
      await supabase
        .from('invitations')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', invitationId);

    } else {
      // Fallback: Log email content if no email service is configured
      console.log('Email would be sent to:', email);
      console.log('Email content:', emailHtml);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});