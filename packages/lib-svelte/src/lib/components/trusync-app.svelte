<script lang="ts">
  import { setContext } from 'svelte';
  import { trusyncApp, type Channel } from 'trusync';
  import { APP_KEY, IDENTITY_KEY } from '../constants/context-keys';
  import { identityStore } from '../stores/trusync-identity-store';

  export let channels: Channel[];

  const app = trusyncApp();

  for (const channel of channels) {
    app.pushChannel(channel);
  }

  setContext(APP_KEY, app);
  setContext(IDENTITY_KEY, identityStore(app.identity));
</script>

<slot />
