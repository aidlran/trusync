<script lang="ts">
  import { goto } from '$app/navigation';
  import { getApp } from '$lib/functions/get-app';

  export let noAuthRedirect: string | undefined = undefined;

  const app = getApp();

  if (noAuthRedirect && !$app.sessionIsActive) {
    goto(noAuthRedirect);
  }
</script>

{#if $app.sessionIsActive}
  <slot />
  <slot name="auth" />
{:else}
  <slot name="noauth" />
{/if}
