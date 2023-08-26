<script lang="ts">
  import { setContext } from 'svelte';
  import { TrusyncApp, type StorageDriver } from 'trusync';
  import { DataStores } from '$lib/classes/data-stores.js';
  import { APP_KEY, DATA_STORES_KEY } from '$lib/constants/context-keys.js';

  export let drivers: StorageDriver[];

  const app = new TrusyncApp();

  for (const driver of drivers) {
    app.pushStorageDriver(driver);
  }

  setContext(APP_KEY, app);
  setContext(DATA_STORES_KEY, new DataStores());

  interface $$Slots {
    default: { app: TrusyncApp };
  }
</script>

<slot {app} />
