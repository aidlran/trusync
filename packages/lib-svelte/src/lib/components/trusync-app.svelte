<script lang="ts">
  import { setContext } from 'svelte';
  import { TrusyncApp, type StorageDriver } from 'trusync';
  import { APP_KEY } from '$lib/constants/context-keys.js';
  import { trusyncAppStore } from '$lib/stores/trusync-app-store';

  export let drivers: StorageDriver[];

  const app = new TrusyncApp();

  for (const driver of drivers) {
    app.pushStorageDriver(driver);
  }

  setContext(APP_KEY, trusyncAppStore(app));
</script>

<slot />
