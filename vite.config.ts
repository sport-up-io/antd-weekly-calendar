import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // This is correct
      name: 'AntdWeeklyCalendar',
      fileName: (format) => `antd-weekly-calendar.${format}.js`,
      formats: ['es', 'umd'], // Library output formats
    },
    rollupOptions: {
      external: (id) =>
        id === 'react' ||
        id === 'react-dom' ||
        id.startsWith('react/') ||
        id.startsWith('react-dom/') ||
        id === 'antd' ||
        id.startsWith('antd/') ||
        id === '@ant-design/cssinjs',
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react/jsx-dev-runtime': 'ReactJSXDevRuntime',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOMClient',
          antd: 'antd',
          '@ant-design/cssinjs': 'cssinjs',
          'antd/es/date-picker/generatePicker': 'antdDatePickerGeneratePicker',
        },
      },
    },

    emptyOutDir: false, // Prevent Vite from clearing the output directory
  },
});
