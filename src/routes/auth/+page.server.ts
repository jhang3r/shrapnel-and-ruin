import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateGuestUsername } from '$lib/auth';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  if (user) redirect(303, '/lobby');
};

export const actions: Actions = {
  login: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    if (error) return fail(400, { message: error.message });
    redirect(303, '/lobby');
  },

  register: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const username = (data.get('username') as string | null)?.trim() ?? '';

    if (!username || username.length < 3 || username.length > 24) {
      return fail(400, { message: 'Pilot name must be 3\u201324 characters.' });
    }

    const { data: authData, error } = await locals.supabase.auth.signUp({ email, password });
    if (error) return fail(400, { message: error.message });

    if (!authData.user) return fail(500, { message: 'Sign up failed. Please try again.' });

    const { error: profileError } = await locals.supabase.from('profiles').insert({
      id: authData.user.id,
      username,
      is_guest: false
    });
    if (profileError) return fail(500, { message: profileError.message });

    // If email confirmation is required, session won't exist yet
    if (!authData.session) {
      return fail(200, { message: 'Check your email to confirm your account before logging in.' });
    }

    redirect(303, '/lobby');
  },

  guest: async ({ locals }) => {
    const { data: authData, error } = await locals.supabase.auth.signInAnonymously();
    if (error) return fail(400, { message: error.message });
    if (!authData.user) return fail(500, { message: 'Guest sign in failed.' });

    // Retry on username collision (up to 5 attempts)
    let profileError = null;
    for (let i = 0; i < 5; i++) {
      const username = generateGuestUsername();
      const { error: err } = await locals.supabase.from('profiles').insert({
        id: authData.user.id,
        username,
        is_guest: true
      });
      if (!err) { profileError = null; break; }
      profileError = err;
    }
    if (profileError) return fail(500, { message: 'Could not create guest profile. Please try again.' });

    redirect(303, '/lobby');
  },

  logout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    redirect(303, '/auth');
  }
};
