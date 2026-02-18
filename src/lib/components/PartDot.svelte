<script lang="ts">
  let { hp, maxHp, name, selectable = false, onSelect }: {
    hp: number; maxHp: number; name: string; selectable?: boolean; onSelect?: () => void;
  } = $props();

  const ratio = $derived(hp / maxHp);
  const color = $derived(
    hp <= 0 ? 'bg-slate-600' :
    ratio < 0.25 ? 'bg-red-500' :
    ratio < 0.6 ? 'bg-yellow-400' : 'bg-green-500'
  );
</script>

<button
  title="{name}: {hp}/{maxHp}"
  class="w-4 h-4 rounded-full {color} {selectable ? 'ring-2 ring-cyan-400 cursor-pointer' : 'cursor-default'}"
  onclick={onSelect}
  disabled={!selectable}
/>
