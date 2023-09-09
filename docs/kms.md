> This README is deprecated. KMS is no longer a separate package.

<div align=center>

# [Enclave KMS](https://github.com/enclavetech/kms)

[![Build Status](https://github.com/enclavetech/kms/actions/workflows/test.yml/badge.svg)](https://github.com/enclavetech/kms/actions/workflows/test.yml) [![Known Vulnerabilities](https://snyk.io/test/github/enclavetech/kms/badge.svg)](https://snyk.io/test/github/enclavetech/kms) [![License](https://img.shields.io/github/license/enclavetech/kms)](LICENSE)

</div>

<!-- TODO: table of contents -->

## About

This package deals with the handling of cryptographic keys in your frontend web app. It aims to do so in a convenient, secure and performant way, by exposing a simple, strongly typed API that does the heavy lifting.

In addition, the [core package](packages/core) has been designed to be extensible rather than being tied to a single encryption/signing library. See [Library Support](#library-support).

The core package itself has [no direct dependencies](packages/core/package.json).

## How does it work?

Under the hood, it uses web workers to isolate the keys and function executions from the main thread. This helps security by making it much harder for rogue dependencies in your code to intercept those keys.

## What's Implemented?

### Features

|                 Status                 | Feature                            |
| :------------------------------------: | :--------------------------------- |
| [:white_check_mark:](## 'Implemented') | Import keys                        |
| [:white_check_mark:](## 'Implemented') | Symmetric encrypt/decrypt          |
| [:white_check_mark:](## 'Implemented') | Asymmetric encrypt/decrypt         |
| [:white_check_mark:](## 'Implemented') | Hybrid encrypt/decrypt             |
|     [:construction:](## 'Planned')     | Signing/verifying                  |
| [:white_check_mark:](## 'Implemented') | Session import/export/destroy      |
| [:white_check_mark:](## 'Implemented') | Pooling (multiple workers/threads) |
| [:white_check_mark:](## 'Implemented') | Bring your own crypto library      |
|     [:construction:](## 'Planned')     | Tests                              |

### Platform Support

|                Status                | Platform |
| :----------------------------------: | :------- |
| [:white_check_mark:](## 'Supported') | Browser  |
|    [:construction:](## 'Planned')    | Node.js  |

### Library Support

Enclave KMS has been designed in a generic way to enable its use with virtually any crypto system simply by creating an adapter. The following are officially supported or planned:

<!-- TODO: provide adapter docs -->

|                Status                | Library                                                                      | Adapter Package                                         | Notes                       |
| :----------------------------------: | :--------------------------------------------------------------------------- | :------------------------------------------------------ | :-------------------------- |
| [:white_check_mark:](## 'Supported') | [OpenPGP.js](https://openpgpjs.org)                                          | [`@enclavetech/kms-openpgp`](packages/adapters/openpgp) |
|   [:yellow_square:](## 'Partial')    | [jose](https://github.com/panva/jose)                                        | [`@enclavetech/kms-jose`](packages/adapters/jose)       | `hybrid` API not supported. |
|    [:construction:](## 'Planned')    | [WebCrypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) |

<!-- TODO: library feature support matrix -->
<!-- TODO: benchmarks -->

## Installation

Install `@enclavetech/kms-core`, `@enclavetech/kms-openpgp`, and its peer dependency `openpgp`:

```sh
npm i https://gitpkg.now.sh/enclavetech/kms/packages/core https://gitpkg.now.sh/enclavetech/kms/packages/adapters/openpgp openpgp
```

### TypeScript

If you are using TypeScript, you may need to install `@openpgp/web-stream-tools` as a devDependency too.

See: <https://github.com/openpgpjs/openpgpjs#typescript>.

```sh
npm i -D @openpgp/web-stream-tools
```

## Usage

1. Create a new file which will be used as the entry point for your web worker(s):

   ```js
   // worker.js

   import { Worker } from '@enclavetech/kms-core';
   import Adapter from '@enclavetech/kms-openpgp';

   // Instantiate library adapter
   const adapter = new Adapter();

   // Instantiate the worker logic and pass in the library adapter
   new Worker(adapter);
   ```

2. In your application code, configure a new KMS service:

   ```js
   import {
     KMS,
     AsymmetricNS,
     HybridNS,
     KeysNS,
     SessionNS,
     SymmetricNS,
   } from '@enclavetech/kms-core';

   // Define a function for creating the worker
   function createKmsWorker() {
     // Depending on your app's build system, you may need to change these params
     return new Worker(new URL('./worker.js?worker', import.meta.url), {
       type: 'module',
     });
   }

   const config = {
     clusterSize: 2,
     // Provide the namespace constructors you need
     // (this enables tree shakable code)
     asymmetric: AsymmetricNS,
     hybrid: HybridNS,
     keys: KeysNS,
     session: SessionNS,
     symmetric: SymmetricNS,
   };

   // Instantiate a KMS service
   const kms = new KMS(createKmsWorker, config);
   ```

## API Reference

TODO
