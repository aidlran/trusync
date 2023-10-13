<script lang="ts">
  import { goto } from '$app/navigation';
  import { getIdentity } from '../functions/get-identity';

  export let noAuthRedirect: string | undefined = undefined;

  const identity = getIdentity();
  let hasIdentity: boolean;

  $: hasIdentity = !!$identity.importedAddresses.length;

  if (noAuthRedirect && !hasIdentity) {
    void goto(noAuthRedirect);
  }
</script>

{#if hasIdentity}
  <slot />
  <slot name="auth" />
{:else}
  <slot name="noauth" />
{/if}
