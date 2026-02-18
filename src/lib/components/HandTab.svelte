<script lang="ts">
  import CardView from './CardView.svelte';
  let { player, phase, cardDefs, onPlayCard, onDiscardCard, onFire }: {
    player: any; phase: string; cardDefs: Record<string, any>;
    onPlayCard: (cardId: string, installPart?: string) => void;
    onDiscardCard: (cardId: string) => void;
    onFire: (weaponCardId: string) => void;
  } = $props();

  let selected = $state<string | null>(null);

  const weapons = $derived(
    phase === 'combat'
      ? Object.values((player?.parts ?? {}) as Record<string, any>)
          .flatMap((p: any) => p.installed_components)
          .filter((c: any) => c.is_active && cardDefs[c.card_id]?.stats?.slot_type === 'weapon')
      : []
  );
</script>

<div class="p-4 space-y-4">
  {#if phase === 'combat'}
    <div class="text-xs text-slate-400 uppercase tracking-wider">Weapons</div>
    <div class="flex gap-2 overflow-x-auto pb-2">
      {#each weapons as w}
        <button onclick={() => onFire(w.card_id)}
          disabled={player.ap < 1}
          class="flex-shrink-0 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm disabled:opacity-40 hover:border-cyan-500">
          {cardDefs[w.card_id]?.name ?? w.card_id}
          <span class="block text-xs text-slate-400">1 AP</span>
        </button>
      {/each}
      {#if weapons.length === 0}
        <p class="text-slate-500 text-sm">No weapons installed.</p>
      {/if}
    </div>
  {:else}
    <div class="text-xs text-slate-400 uppercase tracking-wider">Hand ({player?.hand?.length ?? 0})</div>
    <div class="flex gap-2 overflow-x-auto pb-2">
      {#each (player?.hand ?? []) as cardId}
        <CardView
          {cardId} cardDef={cardDefs[cardId]}
          selected={selected === cardId}
          onTap={() => selected = selected === cardId ? null : cardId}
        />
      {/each}
    </div>

    {#if selected}
      <div class="flex gap-2">
        <button onclick={() => { onPlayCard(selected!); selected = null; }}
          class="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm">Play</button>
        <button onclick={() => { onDiscardCard(selected!); selected = null; }}
          class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">Discard for Effect</button>
      </div>
    {/if}
  {/if}
</div>
