import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
const meta: Meta<typeof Button> = { title: 'UI/Button', component: Button, args: { children: 'Button' } };
export default meta;
export const Primary: StoryObj<typeof Button> = { args: { variant:'primary' } };
export const Ghost: StoryObj<typeof Button> = { args: { variant:'ghost' } };