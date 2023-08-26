<script lang="ts">
  import { Session } from 'trusync';
  import { goto } from '$app/navigation';
  import { init } from '../functions/init.js';

  export let noAuthRedirect: string;

  init();

  const initSession = Session.resume().catch(() => goto(noAuthRedirect));
</script>

{#await initSession then}
  <slot />
{/await}
