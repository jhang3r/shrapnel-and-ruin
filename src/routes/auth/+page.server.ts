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
    const username = data.get('username') as string;
    const { data: authData, error } = await locals.supabase.auth.signUp({ email, password });
    if (error) return fail(400, { message: error.message });
    if (authData.user) {
      await locals.supabase.from('profiles').insert({
        id: authData.user.id,
        username,
        is_guest: false
      });
    }
    redirect(303, '/lobby');
  },

  guest: async ({ locals }) => {
    const username = generateGuestUsername();
    const { data: authData, error } = await locals.supabase.auth.signInAnonymously();
    if (error) return fail(400, { message: error.message });
    if (authData.user) {
      await locals.supabase.from('profiles').insert({
        id: authData.user.id,
        username,
        is_guest: true
      });
    }
    redirect(303, '/lobby');
  },

  logout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    redirect(303, '/auth');
  }
};
