<script lang="ts">
  import { PUBLIC_SUPABASE_URL } from '$env/static/public';
  import HandTab from './HandTab.svelte';
  import MechTab from './MechTab.svelte';
  import EnemyTab from './EnemyTab.svelte';
  import ConsoleOverlay from './ConsoleOverlay.svelte';
  import PartDot from './PartDot.svelte';
  import { gameState, myUserId } from '$lib/game-store';
  import { createClient } from '$lib/supabase';

  let { roomId, cardDefs }: { roomId: string; cardDefs: Record<string, any> } = $props();

  const supabase = createClient();
  let tab = $state<'hand' | 'mech' | 'enemy'>('hand');
  let showConsole = $state(false);
  let toastMsg = $state('');

  const state = $derived($gameState);
  const uid = $derived($myUserId);
  const me = $derived(state?.players[uid!]);
  const isMyTurn = $derived(state?.active_player_id === uid);
  const enemies = $derived(
    Object.entries(state?.players ?? {})
      .filter(([id, p]) => id !== uid && !(p as any).is_eliminated)
      .map(([userId, playerState]) => ({ userId, state: playerState }))
  );

  function toast(msg: string) { toastMsg = msg; setTimeout(() => toastMsg = '', 3000); }

  async function callEdge(fn: string, body: object) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast('Not authenticated'); return null; }
    let res: Response;
    try {
      res = await fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/${fn}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ room_id: roomId, ...body })
      });
    } catch {
      toast('Network error');
      return null;
    }
    if (!res.ok) {
      toast(`Server error (${res.status})`);
      return null;
    }
    const data = await res.json();
    if (data.error) toast(data.error);
    return data;
  }

  async function playCard(cardId: string, installPart?: string) {
    await callEdge('play-card', { card_id: cardId, install_part: installPart });
  }

  async function discardCard(cardId: string) {
    await callEdge('discard-card', { card_id: cardId });
  }

  let pendingWeapon = $state<string | null>(null);
  let attacking = $state(false);

  function fireWeapon(weaponCardId: string) {
    pendingWeapon = weaponCardId;
    tab = 'enemy';
    toast('Select a target part on the Enemy tab');
  }

  async function selectTarget(targetUserId: string, targetPart: string) {
    if (!pendingWeapon || attacking) return;
    attacking = true;
    const weapon = pendingWeapon;
    pendingWeapon = null;  // clear immediately to prevent re-entry
    tab = 'hand';
    try {
      await callEdge('attack', { weapon_card_id: weapon, target_user_id: targetUserId, target_part: targetPart });
    } finally {
      attacking = false;
    }
  }

  async function endTurn() {
    await callEdge('end-turn', {});
  }

  async function useAbility(abilityName: string, cost: number) {
    await callEdge('change-ability', { ability: abilityName });
    showConsole = false;
  }
</script>

<div class="flex flex-col h-screen max-h-screen">
  <!-- Top bar -->
  <div class="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-700 flex-shrink-0">
    <span class="text-xs text-slate-400 uppercase">{state?.phase ?? '—'}</span>
    <span class="text-sm font-mono">AP: {me?.ap ?? 0}/{me?.ap_per_turn ?? 0}</span>
    <button onclick={endTurn} disabled={!isMyTurn}
      class="px-3 py-1 bg-red-700 hover:bg-red-600 disabled:opacity-30 rounded text-xs font-bold">
      END TURN
    </button>
  </div>

  <!-- Mech portrait bar -->
  <div class="flex items-center gap-3 px-3 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
    <button onclick={() => showConsole = true} class="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-lg">
      🤖
    </button>
    <div class="flex-1 space-y-1">
      <div class="flex items-center gap-1 h-2">
        {@const totalHp = me ? Object.values(me.parts).reduce((s, p) => s + (p as any).hp, 0) : 0}
        {@const maxHp = me ? Object.values(me.parts).reduce((s, p) => s + (p as any).max_hp, 0) : 1}
        <div class="flex-1 bg-slate-700 rounded-full h-2">
          <div class="bg-green-500 h-2 rounded-full transition-all" style="width: {(totalHp / maxHp) * 100}%"></div>
        </div>
        <span class="text-xs text-slate-400">{totalHp}</span>
      </div>
      {#if me?.shield}
        <div class="flex items-center gap-1 h-2">
          <div class="flex-1 bg-slate-700 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: {(me.shield.sp / me.shield.max_sp) * 100}%"></div>
          </div>
          <span class="text-xs text-slate-400">{me.shield.sp}</span>
        </div>
      {/if}
    </div>
    <div class="flex gap-1">
      {#each ['head','torso','left_arm','right_arm','left_leg','right_leg'] as part}
        {@const p = me?.parts[part]}
        {#if p}
          <PartDot hp={(p as any).hp} maxHp={(p as any).max_hp} name={part} />
        {/if}
      {/each}
    </div>
  </div>

  <!-- Tab content -->
  {#if pendingWeapon}
    <div class="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-sm">
      <span class="text-cyan-400">Targeting mode — select enemy part</span>
      <button onclick={() => { pendingWeapon = null; tab = 'hand'; }} class="text-slate-400 text-xs underline">Cancel</button>
    </div>
  {/if}
  <div class="flex-1 overflow-y-auto">
    {#if tab === 'hand'}
      <HandTab player={me} phase={state?.phase ?? 'build'} {cardDefs} onPlayCard={playCard} onDiscardCard={discardCard} onFire={fireWeapon} />
    {:else if tab === 'mech'}
      <MechTab player={me} />
    {:else}
      <EnemyTab {enemies} phase={state?.phase ?? 'build'} hasTargeting={me?.targeting_system ?? false} onSelectTarget={selectTarget} />
    {/if}
  </div>

  <!-- Toast -->
  {#if toastMsg}
    <div class="absolute top-16 left-0 right-0 flex justify-center pointer-events-none">
      <div class="bg-slate-700 text-sm px-4 py-2 rounded-full shadow-lg">{toastMsg}</div>
    </div>
  {/if}

  <!-- Tab bar -->
  <div class="flex border-t border-slate-700 bg-slate-900 flex-shrink-0">
    {#each [['hand', 'Hand'], ['mech', 'My Mech'], ['enemy', 'Enemy']] as [t, label]}
      <button onclick={() => tab = t as any}
        class="flex-1 py-3 text-sm {tab === t ? 'text-cyan-400 border-t-2 border-cyan-400' : 'text-slate-400'}">
        {label}
      </button>
    {/each}
  </div>
</div>

{#if showConsole}
  <ConsoleOverlay
    frameCardId={me?.frame_card_id ?? ''}
    frameStats={cardDefs[me?.frame_card_id ?? '']?.stats}
    ap={me?.ap ?? 0}
    onAbility={useAbility}
    onClose={() => showConsole = false}
  />
{/if}
