<script lang="ts">
  import { createClient } from '$lib/supabase';
  import { PUBLIC_SUPABASE_URL } from '$env/static/public';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();

  const supabase = createClient();
  let selectedDeckId = $state(data.decks[0]?.id ?? '');
  let joinCode = $state('');
  let error = $state('');
  let loading = $state(false);

  async function callEdge(fn: string, body: object) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/${fn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  async function createRoom() {
    loading = true; error = '';
    const result = await callEdge('create-room', { max_players: 4, deck_id: selectedDeckId });
    if (result.error) { error = result.error; loading = false; return; }
    window.location.href = `/room/${result.id}`;
  }

  async function joinRoom() {
    loading = true; error = '';
    const result = await callEdge('join-room', { room_code: joinCode, deck_id: selectedDeckId });
    if (result.error) { error = result.error; loading = false; return; }
    window.location.href = `/room/${result.room_id}`;
  }
</script>

<div class="p-4 max-w-sm mx-auto space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-xl font-bold">Lobby</h1>
    <a href="/decks" class="text-sm text-cyan-400">My Decks</a>
  </div>

  <div>
    <label class="block text-sm text-slate-400 mb-1">Select Deck</label>
    <select bind:value={selectedDeckId} class="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm">
      {#each data.decks as deck}
        <option value={deck.id}>{deck.name}</option>
      {:else}
        <option disabled>No decks — create one first</option>
      {/each}
    </select>
  </div>

  {#if error}
    <p class="text-red-400 text-sm">{error}</p>
  {/if}

  <button onclick={createRoom} disabled={loading || !selectedDeckId}
    class="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded font-medium">
    Create Room
  </button>

  <div class="relative flex items-center gap-2">
    <div class="flex-1 border-t border-slate-700"></div>
    <span class="text-slate-500 text-xs">or join</span>
    <div class="flex-1 border-t border-slate-700"></div>
  </div>

  <div class="flex gap-2">
    <input bind:value={joinCode} placeholder="Room code" maxlength="6"
      class="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm uppercase tracking-widest" />
    <button onclick={joinRoom} disabled={loading || joinCode.length < 6 || !selectedDeckId}
      class="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-sm">
      Join
    </button>
  </div>
</div>
