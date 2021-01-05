import {terser} from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import {nodeResolve} from '@rollup/plugin-node-resolve'

const output = (file, format, plugins) => ({
  input: './src/index.js',
  output: {
    name: 'polygonsplit',
    file,
    format,
    exports: 'default'
  },
  plugins
})

export default [
  output('./dist/polygonsplit.js', 'umd', [nodeResolve(), commonjs()]),
  output('./dist/polygonsplit.min.js', 'umd', [nodeResolve(), commonjs(), terser()]),
  output('./dist/polygonsplit.es.js', 'es', [nodeResolve(), commonjs()])
]
