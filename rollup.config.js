import {terser} from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import buble from '@rollup/plugin-buble'

const output = (file, format, plugins) => ({
  input: './src/index.js',
  output: {
    name: 'polygonsplitter',
    file,
    format,
    exports: 'default'
  },
  plugins
})

export default [
  output('./dist/polygonsplitter.mjs', 'es', [commonjs(), buble()]),
  output('./dist/polygonsplitter.js', 'umd', [commonjs(), buble()]),
  output('./dist/polygonsplitter.min.js', 'umd', [commonjs(), nodeResolve(), buble(), terser()])
]
