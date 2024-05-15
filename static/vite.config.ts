import {defineConfig} from 'vite';
import viteEslintPlugin from 'vite-plugin-eslint';
import viteRestartPlugin from 'vite-plugin-restart';
import viteStylelintPlugin from 'vite-plugin-stylelint';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({command}) => ({
    base: command === 'serve' ? '' : '/dist/',
    build: {
        emptyOutDir: true,
        manifest: true,
        outDir: '../src/web/assets/dist',
        rollupOptions: {
            input: {
                matrixExtended: 'src/js/matrixExtended.ts',
            },
            output: {
                sourcemap: true
            },
        }
    },
    plugins: [
        viteRestartPlugin({
            reload: [
                '../src/templates/**/*',
            ],
        }),
        viteEslintPlugin({
            cache: false,
            fix: true,
        }),
        viteStylelintPlugin({
            fix: true,
            lintInWorker: true
        })
    ],
    resolve: {
        alias: [
            {find: '@', replacement: path.resolve(__dirname, './src')},
        ],
        preserveSymlinks: true,
    },
    server: {
        fs: {
            strict: false
        },
        host: '0.0.0.0',
        origin: 'http://localhost:' + process.env.DEV_PORT,
        port: parseInt(process.env.DEV_PORT),
        strictPort: true,
    }
}));
