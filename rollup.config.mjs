// rollup.config.mjs

import alias from '@rollup/plugin-alias';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/passport-widget.tsx',
  output: {
    file: 'dist/passport-widget.js',
    format: 'umd',
    name: 'BedrockPassportWidget',
    inlineDynamicImports: true,
  },
  plugins: [
    // 1) fix "react/index.js" => "react" so "useRef" can be found
    alias({
      entries: [
        { find: /^react\/index$/,    replacement: 'react' },
        { find: /^react\/index\.js$/, replacement: 'react' },
      ],
    }),

   

    // 3) Let Rollup resolve dependencies, not preferring built-in Node
    resolve({
      browser: true,
      preferBuiltins: false, // crucial to ensure we use polyfill, not Node
      mainFields: ['browser', 'module', 'main'],
    }),

    // 4) Convert leftover CJS → ESM
    commonjs({
      include: /node_modules/,
      namedExports: {
        react: [
          'useRef',
          'useEffect',
          'useState',
          'useLayoutEffect',
          'useCallback',
          'useMemo',
        ],
      },
    }),

    // 5) Replace process.env.NODE_ENV with "production"
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),

    // 6) Handle CSS from @bedrock_org/passport
    postcss({
      extract: false,
      minimize: true,
    }),

    // 7) Finally compile TypeScript/TSX
    typescript({
      tsconfig: './tsconfig.json',
    }),
 // 2) Polyfill Node features for the browser (Buffer, etc.)
    nodePolyfills(),
  ],
};
