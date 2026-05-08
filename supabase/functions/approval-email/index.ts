import { Resend } from 'npm:resend@4.6.0';

const resendKey = Deno.env.get('RESEND_API_KEY') || '';
const fromEmail = Deno.env.get('APPROVAL_EMAIL_FROM') || 'Talk2SQL <no-reply@example.com>';
const resend = new Resend(resendKey);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { email, status, loginUrl } = await req.json();
    if (!email || !status) {
      return Response.json({ error: 'email and status are required' }, { status: 400 });
    }

    const approved = status === 'approved';
    const subject = approved ? 'Your Talk2SQL account is approved' : 'Your Talk2SQL account was rejected';
    const html = approved
      ? `<p>Your account has been approved.</p><p><a href="${loginUrl || ''}">Log in to Talk2SQL</a></p>`
      : '<p>Your account request was rejected. Contact an administrator for details.</p>';

    await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject,
      html,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[approval-email] error', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
});
