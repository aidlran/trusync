<script lang="ts">
  import { setContext } from 'svelte';
  import { TrusyncApp, type StorageDriver } from 'trusync';
  import { APP_KEY } from '$lib/constants/context-keys.js';

  export let drivers: StorageDriver[];

  const app = new TrusyncApp();

  for (const driver of drivers) {
    app.pushStorageDriver(driver);
  }

  setContext(APP_KEY, app);

  interface $$Slots {
    default: { app: TrusyncApp };
  }
</script>

<slot {app} />
