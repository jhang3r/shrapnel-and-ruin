<script lang="ts">
  let { cardId, cardDef, selected = false, onTap }: {
    cardId: string; cardDef: any; selected?: boolean; onTap?: () => void;
  } = $props();
</script>

<button
  onclick={onTap}
  class="relative w-24 h-36 flex-shrink-0 rounded-lg border-2 {selected ? 'border-cyan-400' : 'border-slate-600'} bg-slate-800 p-1 text-left transition-transform {selected ? '-translate-y-2' : ''}"
>
  {#if cardDef?.image_url}
    <img src={cardDef.image_url} alt={cardDef.name} class="w-full h-16 object-cover rounded" />
  {:else}
    <div class="w-full h-16 rounded bg-slate-700 flex items-center justify-center text-slate-500 text-xs">
      {cardDef?.type ?? '?'}
    </div>
  {/if}
  <div class="mt-1 text-xs font-medium leading-tight">{cardDef?.name ?? cardId}</div>
  <div class="text-xs text-slate-400">{cardDef?.point_cost ?? ''}pt</div>
</button>
