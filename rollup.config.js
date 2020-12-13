import {terser} from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const output = (file, plugins) => ({
    input: './src/index.js',
    output: {
        name: 'polysplit',
        file,
        format: 'umd',
        exports: 'default'
    },
    plugins
})

export default [
    output('./dist/polysplit.js', [nodeResolve(), commonjs()]),
    output('./dist/polysplit.min.js', [nodeResolve(), commonjs(), terser()])
]