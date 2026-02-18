<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();

  const deckMap = $derived(new Map(data.deckCards.map(dc => [dc.card_id, dc.quantity])));
  const totalCards = $derived([...deckMap.values()].reduce((s, v) => s + v, 0));
</script>

<div class="p-4 max-w-lg mx-auto space-y-4">
  <div class="flex items-center gap-2">
    <a href="/decks" class="text-slate-400 text-sm">← Decks</a>
    <form method="POST" action="?/rename" class="flex-1 flex gap-2">
      <input name="name" value={data.deck.name}
        class="flex-1 bg-transparent border-b border-slate-600 focus:border-cyan-500 outline-none text-lg font-bold" />
      <button type="submit" class="text-xs text-slate-400 hover:text-white">Save</button>
    </form>
  </div>

  <div class="flex items-center justify-between text-sm">
    <span class="text-slate-400">{totalCards}/60 cards</span>
    <form method="POST" action="?/validate">
      <button type="submit" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded">Validate</button>
    </form>
  </div>

  {#if form?.validationError}
    <p class="text-red-400 text-sm">{form.validationError}</p>
  {:else if form?.valid}
    <p class="text-green-400 text-sm">Deck is valid!</p>
  {/if}

  {#each ['frame','component','action','energy','armor'] as cardType}
    <div>
      <h2 class="text-xs uppercase tracking-wider text-slate-400 mb-2">{cardType}s</h2>
      <div class="space-y-1">
        {#each data.allCards.filter(c => c.type === cardType) as card}
          {@const qty = deckMap.get(card.id) ?? 0}
          <div class="flex items-center gap-2 p-2 bg-slate-800 rounded text-sm">
            <span class="flex-1">{card.name}</span>
            <span class="text-slate-500">{card.point_cost}pt</span>
            <form method="POST" action="?/setCard" class="flex items-center gap-1">
              <input type="hidden" name="card_id" value={card.id} />
              <button type="submit" name="quantity" value={qty - 1}
                class="w-6 h-6 bg-slate-700 rounded text-center hover:bg-slate-600">-</button>
              <span class="w-4 text-center">{qty}</span>
              <button type="submit" name="quantity" value={qty + 1}
                class="w-6 h-6 bg-slate-700 rounded text-center hover:bg-slate-600">+</button>
            </form>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>
