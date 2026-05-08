import { createClient } from '@supabase/supabase-js';

export async function ensureSuperAdminSeeded() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const seedEmail = process.env.SUPER_ADMIN_EMAIL;
  const seedPassword = process.env.SUPER_ADMIN_PASSWORD;
  const seedName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  if (!url || !serviceRoleKey || !seedEmail || !seedPassword) {
    return;
  }

  const adminClient = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false } });
  const { data: existing } = await adminClient
    .from('users')
    .select('user_id')
    .eq('email', seedEmail)
    .eq('role', 'super_admin')
    .maybeSingle();

  if (existing) {
    return;
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: seedEmail,
    password: seedPassword,
    email_confirm: true,
    user_metadata: { full_name: seedName },
  });

  if (createError || !created.user) {
    return;
  }

  await adminClient.from('users').upsert({
    auth_user_id: created.user.id,
    email: seedEmail,
    username: seedName,
    role: 'super_admin',
    status: 'approved',
    approved_at: new Date().toISOString(),
  });
}
