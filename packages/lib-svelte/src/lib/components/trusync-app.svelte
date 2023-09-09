<script lang="ts">
  import { setContext } from 'svelte';
  import { trusyncApp, type StorageDriver } from 'trusync';
  import { APP_KEY, IDENTITY_KEY } from '../constants/context-keys.js';
  import { identityStore } from '../stores/trusync-identity-store';

  export let drivers: StorageDriver[];

  const app = trusyncApp();

  for (const driver of drivers) {
    app.pushStorageDriver(driver);
  }

  setContext(APP_KEY, app);
  setContext(IDENTITY_KEY, identityStore(app.identity));
</script>

<slot />
