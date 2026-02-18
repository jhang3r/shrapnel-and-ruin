<script lang="ts">
  import type { ActionData } from './$types';
  let { form }: { form: ActionData } = $props();
  let mode = $state<'login' | 'register'>('login');
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-sm space-y-4">
    <h1 class="text-2xl font-bold text-center">BetterGame</h1>

    {#if form?.message}
      <p class="text-red-400 text-sm text-center">{form.message}</p>
    {/if}

    <div class="flex rounded overflow-hidden border border-slate-700">
      <button onclick={() => mode = 'login'}
        class="flex-1 py-2 text-sm {mode === 'login' ? 'bg-slate-700' : 'bg-slate-900'}">
        Login
      </button>
      <button onclick={() => mode = 'register'}
        class="flex-1 py-2 text-sm {mode === 'register' ? 'bg-slate-700' : 'bg-slate-900'}">
        Register
      </button>
    </div>

    {#if mode === 'login'}
      <form method="POST" action="?/login" class="space-y-3">
        <input name="email" type="email" placeholder="Email" required
          class="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-sm" />
        <input name="password" type="password" placeholder="Password" required
          class="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-sm" />
        <button type="submit" class="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-medium">
          Login
        </button>
      </form>
    {:else}
      <form method="POST" action="?/register" class="space-y-3">
        <input name="username" type="text" placeholder="Pilot name" required
          class="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-sm" />
        <input name="email" type="email" placeholder="Email" required
          class="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-sm" />
        <input name="password" type="password" placeholder="Password" required minlength="6"
          class="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-sm" />
        <button type="submit" class="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-medium">
          Register
        </button>
      </form>
    {/if}

    <div class="relative flex items-center gap-2">
      <div class="flex-1 border-t border-slate-700"></div>
      <span class="text-slate-500 text-xs">or</span>
      <div class="flex-1 border-t border-slate-700"></div>
    </div>

    <form method="POST" action="?/guest">
      <button type="submit" class="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
        Play as Guest
      </button>
    </form>
  </div>
</div>
