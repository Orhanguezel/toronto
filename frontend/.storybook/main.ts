import type { StorybookConfig } from '@storybook/nextjs';
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx','../src/**/*.stories.@(tsx|mdx)'],
  addons: ['@storybook/addon-essentials','@storybook/addon-interactions'],
  framework: { name: '@storybook/nextjs', options: {} },
  docs: { autodocs: true }
};
export default config;