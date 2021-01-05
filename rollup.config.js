import {terser} from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import {nodeResolve} from '@rollup/plugin-node-resolve'

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
  output('./dist/polygonsplitter.js', 'umd', [nodeResolve(), commonjs()]),
  output('./dist/polygonsplitter.min.js', 'umd', [nodeResolve(), commonjs(), terser()]),
  output('./dist/polygonsplitter.es.js', 'es', [nodeResolve(), commonjs()])
]
