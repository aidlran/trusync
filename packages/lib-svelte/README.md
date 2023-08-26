# truSync for Svelte

## About

This package cybernetically enhances [truSync](https://github.com/aidlran/trusync/tree/main/packages/lib-js) with reactive [stores](https://svelte.dev/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values) and convenient components for Svelte app development.

## Usage

TODO

### SvelteKit SSR Caveat

When using SSR (enabled by default in SvelteKit) you will encounter `ReferenceError: Worker is not defined`.

To solve this you must disable SSR for any pages using truSync. Those pages must have the following in its or an inherited `+layout.js`:

```js
export const ssr = false;
```

This is due to the truSync library using the web worker API, which is only available in the browser environment. _Node has workers but it uses its own API._

This issue will be looked into at some point as SSR can have valid use cases, e.g. to render pages using public (unencrypted) truSync data.
