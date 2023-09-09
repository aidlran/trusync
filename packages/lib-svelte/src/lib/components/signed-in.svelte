<script lang="ts">
  import { goto } from '$app/navigation';
  import { getIdentity } from '../functions/get-identity.js';

  export let noAuthRedirect: string | undefined = undefined;

  const identity = getIdentity();

  if (noAuthRedirect && !$identity.publicKey) {
    void goto(noAuthRedirect);
  }
</script>

{#if $identity.publicKey}
  <slot />
  <slot name="auth" />
{:else}
  <slot name="noauth" />
{/if}
