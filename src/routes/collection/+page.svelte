<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const RARITY_COLORS: Record<string, string> = {
    common: 'text-slate-300',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
  };

  const SCRAP_VALUES: Record<string, number> = {
    common: 5,
    uncommon: 15,
    rare: 40,
    epic: 100,
    legendary: 250,
  };

  let dismantleQty: Record<string, number> = $state({});

  function getQty(cardId: string): number {
    return dismantleQty[cardId] ?? 1;
  }
</script>

<div class="p-4 max-w-4xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">Collection</h1>
    <div class="flex items-center gap-2 text-sm">
      <span class="text-slate-400">Scrap:</span>
      <span class="font-mono text-yellow-400">{data.scrap}</span>
    </div>
  </div>

  {#if form?.message}
    <div class="p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
      {form.message}
    </div>
  {/if}

  {#if form?.success}
    <div class="p-3 bg-green-900/50 border border-green-700 rounded text-green-300 text-sm">
      Dismantled! Gained {form.scrap_gained} scrap.
    </div>
  {/if}

  {#if data.collection.length === 0}
    <p class="text-slate-400 text-sm">Your collection is empty. Open packs to get cards!</p>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.collection as entry}
        {@const card = entry.card_definitions}
        {#if card}
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-semibold text-sm">{card.name}</div>
                <div class="text-xs {RARITY_COLORS[card.rarity] ?? 'text-slate-400'} capitalize">{card.rarity}</div>
                <div class="text-xs text-slate-500 capitalize">{card.card_type}</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold font-mono">&times;{entry.quantity}</div>
                <div class="text-xs text-yellow-500">{SCRAP_VALUES[card.rarity] ?? 5} scrap ea.</div>
              </div>
            </div>

            <form
              method="POST"
              action="?/dismantle"
              use:enhance
              class="flex items-center gap-2 pt-1 border-t border-slate-700"
            >
              <input type="hidden" name="card_id" value={entry.card_id} />
              <input
                type="number"
                name="quantity"
                min="1"
                max={entry.quantity}
                bind:value={dismantleQty[entry.card_id]}
                class="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-center"
              />
              <button
                type="submit"
                class="flex-1 px-3 py-1 bg-orange-700 hover:bg-orange-600 rounded text-xs font-medium"
              >
                Dismantle ({(SCRAP_VALUES[card.rarity] ?? 5) * getQty(entry.card_id)} scrap)
              </button>
            </form>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
