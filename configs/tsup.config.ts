import {defineConfig} from 'tsup'

export default defineConfig([
  {
    entry: {index: "index.ts"},
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
  },
  {
    entry: {"utf-helpers": "index.ts"},
    format: ["iife"],
    globalName: "UtfHelpers",
    minify: true,
    sourcemap: true,
    outExtension: ({format}) => ({js: `.min.js`}),
  },
])
