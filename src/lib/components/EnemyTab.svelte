<script lang="ts">
  import PartDot from './PartDot.svelte';
  let { enemies, phase, hasTargeting, onSelectTarget }: {
    enemies: { userId: string; state: any }[];
    phase: string; hasTargeting: boolean;
    onSelectTarget: (userId: string, part: string) => void;
  } = $props();

  let currentEnemy = $state(0);
  const enemy = $derived(enemies[currentEnemy]);
  const parts = ['head','torso','left_arm','right_arm','left_leg','right_leg'];
  const canTarget = $derived(phase === 'combat' && !enemy?.state.is_eliminated);
</script>

<div class="p-4 space-y-3">
  {#if enemies.length > 1}
    <div class="flex gap-2">
      {#each enemies as e, i}
        <button onclick={() => currentEnemy = i}
          class="flex-1 text-xs py-1 rounded {i === currentEnemy ? 'bg-slate-700' : 'bg-slate-900'}">
          {e.userId.slice(0, 6)}
        </button>
      {/each}
    </div>
  {/if}

  {#if enemy}
    <div class="text-xs text-slate-400">Targeting: {enemy.userId.slice(0, 8)}…</div>
    {#each parts as part}
      {@const p = enemy.state.parts[part]}
      {#if p}
        <div class="flex items-center gap-3 p-2 bg-slate-800 rounded text-sm">
          <PartDot hp={p.hp} maxHp={p.max_hp} name={part}
            selectable={canTarget && hasTargeting}
            onSelect={() => onSelectTarget(enemy.userId, part)} />
          <span class="flex-1 capitalize">{part.replace('_', ' ')}</span>
          <span class="text-slate-400">{p.hp}/{p.max_hp}</span>
        </div>
      {/if}
    {/each}
  {:else}
    <p class="text-slate-400 text-sm">No enemies remaining.</p>
  {/if}
</div>
