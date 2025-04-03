# Bedrock Passport Vanilla JS Wrapper

We aim to create a **single-file** JavaScript “widget” for [Bedrock Passport](https://github.com/redp1ll/bedrock-passport-example) – a React-based library. This lets developers drop a `<script>` tag and call:

```html
<script src="passport-widget.js"></script>
<script>
  BedrockPassport.init({
    tenantId: "YOUR_TENANT",
    callbackUrl: "https://yourdomain.com/auth/callback",
    // ...
  });
</script>
```

…just like Stripe.js or Intercom, **without** building a dedicated React app.

---

## Status: Build Succeeds, Needs Final Testing

- **We managed to bundle** everything by placing the **node polyfill plugin** at the **end** of our Rollup plugin chain. That resolved errors like `"Buffer is undefined"` or `"useRef" not exported"`.
- Next step is **actual testing**: verifying the final `passport-widget.js` properly loads the official `<LoginPanel>` (and doesn’t crash on wallet code). 

Feel free to open the `test-widget.html` in a local server and confirm the login flow works.

---

## Project Overview

```
bedrock-widget/
├─ package.json
├─ rollup.config.mjs          // The rollup config (with alias, nodePolyfills, etc.)
├─ tsconfig.json
├─ src/
│   └─ passport-widget.tsx    // Our wrapper that imports React + @bedrock_org/passport
└─ dist/
   └─ passport-widget.js       // Single-file build
```

- **`src/passport-widget.tsx`**: The main entry that imports `<BedrockPassportProvider>` and `<LoginPanel>` from Bedrock, then defines `BedrockPassport.init(...)`.
- **`rollup.config.mjs`**: We use aliasing (`react/index.js → react`), node polyfills, and inline dynamic imports to produce one UMD file.
- **`test-widget.html`**: A minimal page that loads `dist/passport-widget.js` and calls `BedrockPassport.init(...)`.

---

## Installation & Build

1. **Install** dependencies:
   ```bash
   npm install
   ```
2. **Build**:
   ```bash
   npm run build
   ```
   This outputs **`dist/passport-widget.js`** as a single UMD file.
3. **Serve** locally (e.g., `npx http-server .` or `python3 -m http.server`) so you can open `test-widget.html` via `http://localhost:.../test-widget.html`.

---

## Known Caveats / Next Steps

1. **Web3 / Wagmi**  
   If you set `showWalletConnect: true`, the library references `wagmi` / `siwe`, which rely on Node APIs like `Buffer`. We use `rollup-plugin-node-polyfills`, but heavy usage might still show some runtime edge cases.
2. **React Mismatch**  
   Wagmi forcibly references `'react/index.js'`, so we alias it to `'react'`. That seems stable with **React 18.3.x**. 
3. **Testing**  
   We need to confirm real sign-in flows (Google, Apple, or wallet) actually succeed. If the code tries Node logic at runtime, we might see additional errors. If so, we can consider removing or externalizing wagmi if not needed.

---

## .gitignore

Here’s a recommended `.gitignore` for Node/JS bundler projects:

```gitignore
# Node modules
node_modules/

# Build output
dist/

# Logs and debug
npm-debug.log
yarn-error.log

# OS or Editor files
.DS_Store
Thumbs.db

# Environment / secrets
.env
```

- **`node_modules/`** – not checked into Git.  
- **`dist/`** – your build artifacts. Usually you only commit source, not compiled output.  
- **`.env`** – if you had environment secrets, keep them out of source control.

---

### Final Word

We now have a single-file build. We just need to **test** it thoroughly:

1. Confirm `'Buffer'` references are polyfilled at runtime.  
2. Confirm `'useRef'` references from wagmi or bedrock don’t crash.  
3. Test normal sign-in flows.  

If everything runs smoothly, you can share `passport-widget.js` and let others integrate the official Bedrock Passport panel with minimal fuss.