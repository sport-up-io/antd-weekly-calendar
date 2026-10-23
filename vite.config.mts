import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/** Paquets installés par l'application consommatrice, jamais embarqués. */
const EXTERNAL_PACKAGES = [
  'react',
  'react-dom',
  'antd',
  '@ant-design/icons',
  '@ant-design/cssinjs',
  '@rc-component/picker',
  'date-fns',
];

const isExternal = (id: string): boolean =>
  EXTERNAL_PACKAGES.some((name) => id === name || id.startsWith(`${name}/`));

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDirs: 'dist/types',
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'AntdWeeklyCalendar',
      fileName: (format) => `antd-weekly-calendar.${format}.js`,
      formats: ['es', 'umd'],
    },
    rolldownOptions: {
      external: isExternal,
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          '@ant-design/icons': 'icons',
          '@ant-design/cssinjs': 'cssinjs',
          '@rc-component/picker/generate/dateFns': 'rcPickerDateFns',
          'date-fns': 'dateFns',
          'date-fns/locale': 'dateFnsLocale',
        },
      },
    },
  },
});
