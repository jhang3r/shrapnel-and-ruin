<script lang="ts">
  import '../app.css';
  import { createClient } from '$lib/supabase';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  let { data, children } = $props();
  const supabase = createClient();

  onMount(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event !== 'INITIAL_SESSION') {
        invalidate('supabase:auth');
      }
    });
    return () => subscription.unsubscribe();
  });
</script>

{@render children()}
