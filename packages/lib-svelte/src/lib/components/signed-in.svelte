<script lang="ts">
  import { goto } from '$app/navigation';
  import { app } from '$lib/functions/app';

  export let noAuthRedirect: string;

  if (!app().signedIn) {
    goto(noAuthRedirect);
  }
</script>

<slot />
