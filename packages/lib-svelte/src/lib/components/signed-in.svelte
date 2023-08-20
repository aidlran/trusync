<script lang="ts">
  import { Session } from '@enclavetech/api';
  import { init } from '../functions/init.js';
  import { goto } from '$app/navigation';

  export let noAuthRedirect: string;

  init();

  const initSession = Session.resume().catch(() => goto(noAuthRedirect));
</script>

{#await initSession then}
  <slot />
{/await}
