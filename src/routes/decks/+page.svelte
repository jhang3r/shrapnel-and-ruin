<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="p-4 max-w-lg mx-auto space-y-4">
  {#if (form as any)?.message}
    <p class="text-red-400 text-sm text-center">{(form as any).message}</p>
  {/if}
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-bold">My Decks</h1>
    <form method="POST" action="?/create">
      <button type="submit" class="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm">+ New Deck</button>
    </form>
  </div>

  {#each data.decks as deck}
    <a href="/decks/{deck.id}" class="block p-3 bg-slate-800 rounded border border-slate-700 hover:border-cyan-600">
      <div class="font-medium">{deck.name}</div>
      {#if deck.is_starter}<span class="text-xs text-slate-400">Starter</span>{/if}
    </a>
  {:else}
    <p class="text-slate-400 text-sm">No decks yet. Create one to get started.</p>
  {/each}
</div>
