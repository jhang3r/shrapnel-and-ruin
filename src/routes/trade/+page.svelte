<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="p-4 max-w-lg mx-auto space-y-6">
  <h1 class="text-xl font-bold">Trades</h1>

  {#if form?.message}
    <p class="text-red-400 text-sm">{form.message}</p>
  {/if}

  <section>
    <h2 class="text-base font-semibold mb-2 text-slate-300">Incoming Offers</h2>
    {#if data.incoming.length === 0}
      <p class="text-slate-400 text-sm">No pending trade offers.</p>
    {:else}
      {#each data.incoming as trade}
        <div class="p-3 bg-slate-800 rounded space-y-2 mb-2">
          <div class="text-sm">
            <span class="text-slate-400">From: </span>
            <span>{(trade.profiles as any)?.username ?? trade.initiator_id.slice(0, 8)}</span>
          </div>
          <div class="text-xs text-slate-400">
            Offering: {(trade.offered_card_ids as string[]).join(', ')}
          </div>
          <div class="text-xs text-slate-400">
            Wants: {(trade.requested_card_ids as string[]).join(', ')}
          </div>
          <div class="flex gap-2">
            <form method="POST" action="?/accept">
              <input type="hidden" name="trade_id" value={trade.id} />
              <button type="submit" class="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-xs">Accept</button>
            </form>
            <form method="POST" action="?/reject">
              <input type="hidden" name="trade_id" value={trade.id} />
              <button type="submit" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">Reject</button>
            </form>
          </div>
        </div>
      {/each}
    {/if}
  </section>

  <section>
    <h2 class="text-base font-semibold mb-2 text-slate-300">Sent Offers</h2>
    {#if data.outgoing.length === 0}
      <p class="text-slate-400 text-sm">No recent trade offers sent.</p>
    {:else}
      {#each data.outgoing as trade}
        <div class="p-3 bg-slate-800 rounded text-sm mb-2">
          <div>
            <span class="text-slate-400">To: </span>
            <span>{(trade.profiles as any)?.username ?? trade.recipient_id.slice(0, 8)}</span>
            <span class="ml-2 text-xs px-1 rounded {trade.status === 'accepted' ? 'bg-green-800 text-green-300' : trade.status === 'rejected' ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-300'}">{trade.status}</span>
          </div>
          <div class="text-xs text-slate-400 mt-1">
            Offering: {(trade.offered_card_ids as string[]).join(', ')}
          </div>
          <div class="text-xs text-slate-400">
            Wants: {(trade.requested_card_ids as string[]).join(', ')}
          </div>
        </div>
      {/each}
    {/if}
  </section>
</div>
