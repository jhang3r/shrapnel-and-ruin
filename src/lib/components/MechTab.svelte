<script lang="ts">
  import PartDot from './PartDot.svelte';
  let { player }: { player: any } = $props();
  const parts = ['head','torso','left_arm','right_arm','left_leg','right_leg'];
</script>

<div class="p-4 space-y-3">
  <div class="text-xs uppercase tracking-wider text-slate-400">My Mech</div>
  {#each parts as part}
    {@const p = player?.parts[part]}
    {#if p}
      <div class="flex items-center gap-3 p-2 bg-slate-800 rounded text-sm">
        <PartDot hp={p.hp} maxHp={p.max_hp} name={part} />
        <span class="flex-1 capitalize">{part.replace('_', ' ')}</span>
        <span class="text-slate-400">{p.hp}/{p.max_hp}</span>
        {#if p.armor > 0}<span class="text-cyan-400 text-xs">{p.armor}arm</span>{/if}
        {#each p.installed_components.filter((c: any) => c.is_active) as comp}
          <span class="text-xs bg-slate-700 rounded px-1">{comp.card_id}</span>
        {/each}
      </div>
    {/if}
  {/each}

  {#if player?.shield}
    <div class="p-2 bg-slate-800 rounded text-sm flex items-center gap-2">
      <span class="text-blue-400">Shield</span>
      <div class="flex-1 bg-slate-700 rounded-full h-2">
        <div class="bg-blue-400 h-2 rounded-full" style="width: {(player.shield.sp / player.shield.max_sp) * 100}%"></div>
      </div>
      <span class="text-slate-400 text-xs">{player.shield.sp}/{player.shield.max_sp}</span>
    </div>
  {/if}

  {#if player?.status_effects?.length}
    <div class="text-xs text-slate-400">Status: {player.status_effects.map((se: any) => se.effect).join(', ')}</div>
  {/if}
</div>
