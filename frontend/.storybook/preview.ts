import type { Preview } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { ensotekTheme as theme } from '@/styles/themes/ensotekTheme';
import '@/app/globals.css';
const preview: Preview = { decorators: [(Story)=> (<ThemeProvider theme={theme}><Story/></ThemeProvider>)] };
export const globalTypes = { colorVision: { name: 'Color Vision', toolbar: { items: ['normal','deuteranopia','protanopia','tritanopia'] } } };
export default preview;