<script lang="ts">
  import { PUBLIC_SUPABASE_URL } from '$env/static/public';
  import { createClient } from '$lib/supabase';
  import { gameState, myUserId } from '$lib/game-store';
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const supabase = createClient();

  myUserId.set(data.userId);
  if (data.gameState) gameState.set(data.gameState as any);

  let players = $state(data.players);
  let room = $state(data.room);
  let channel: ReturnType<typeof supabase.channel>;

  onMount(() => {
    channel = supabase.channel(`room:${data.room.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `room_id=eq.${data.room.id}` },
        (payload) => { gameState.set((payload.new as any).state); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_players', filter: `room_id=eq.${data.room.id}` },
        async () => {
          const { data: updated } = await supabase.from('game_players').select('user_id, is_ready, profiles(username)').eq('room_id', data.room.id);
          if (updated) players = updated;
        })
      .subscribe();
  });

  onDestroy(() => { channel?.unsubscribe(); });

  async function callEdge(fn: string, body: object) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  async function setReady() {
    await callEdge('set-ready', { room_id: data.room.id });
  }
</script>

{#if $gameState}
  <!-- Game in progress — render GameScreen -->
  <p class="p-4 text-center text-slate-400">Game in progress — game screen goes here (Task 11)</p>
{:else}
  <!-- Waiting room -->
  <div class="p-4 max-w-sm mx-auto space-y-4">
    <h1 class="text-xl font-bold">Room: {room.room_code}</h1>
    <p class="text-slate-400 text-sm">Share this code with friends</p>

    <div class="space-y-2">
      {#each players as p}
        <div class="flex items-center gap-2 p-2 bg-slate-800 rounded text-sm">
          <span class="flex-1">{(p.profiles as any)?.username ?? 'Unknown'}</span>
          <span class={p.is_ready ? 'text-green-400' : 'text-slate-500'}>{p.is_ready ? 'Ready' : 'Waiting'}</span>
        </div>
      {/each}
    </div>

    {#if !players.find(p => p.user_id === data.userId)?.is_ready}
      <button onclick={setReady} class="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded font-medium">
        Ready
      </button>
    {:else}
      <p class="text-center text-slate-400 text-sm">Waiting for all players...</p>
    {/if}
  </div>
{/if}
