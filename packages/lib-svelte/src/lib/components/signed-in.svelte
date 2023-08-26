<script lang="ts">
  import { Session } from 'trusync';
  import { goto } from '$app/navigation';

  export let noAuthRedirect: string;

  async function onNoAuth(): Promise<void> {
    await goto(noAuthRedirect);
  }

  async function resumeSession(): Promise<void> {
    await Session.resume().catch(onNoAuth);
  }
</script>

{#await resumeSession() then}
  <slot />
{/await}
