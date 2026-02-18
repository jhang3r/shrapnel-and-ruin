<script lang="ts">
  let { frameCardId, frameStats, ap, onAbility, onClose }: {
    frameCardId: string; frameStats: any; ap: number; onAbility: (ability: string, cost: number) => void; onClose: () => void;
  } = $props();

  const abilities = $derived([
    { name: 'Shield Boost', cost: 1, description: 'SP regen doubled this upkeep' },
    { name: 'Weapon Overclock', cost: 1, description: 'Next attack +20% damage' },
    ...(frameStats?.abilities ?? [])
  ]);
</script>

<div class="fixed inset-0 bg-black/80 z-50 flex items-end" onclick={onClose}>
  <div class="w-full bg-slate-900 rounded-t-2xl p-4 space-y-3" onclick={(e) => e.stopPropagation()}>
    <div class="flex items-center justify-between">
      <div>
        <div class="text-xs text-slate-400">Active Frame</div>
        <div class="font-bold font-mono">{frameCardId}</div>
      </div>
      <button onclick={onClose} class="text-slate-400 text-sm">✕ Close</button>
    </div>

    <div class="space-y-2">
      {#each abilities as ability}
        <button
          onclick={() => onAbility(ability.name, ability.cost)}
          disabled={ap < ability.cost}
          class="w-full flex items-center justify-between p-2 bg-slate-800 rounded disabled:opacity-40 hover:bg-slate-700 text-left"
        >
          <div>
            <div class="text-sm font-medium">{ability.name}</div>
            <div class="text-xs text-slate-400">{ability.description}</div>
          </div>
          <span class="text-xs text-cyan-400">{ability.cost} AP</span>
        </button>
      {/each}
    </div>
  </div>
</div>
