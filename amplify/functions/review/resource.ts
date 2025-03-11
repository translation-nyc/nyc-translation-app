import { defineFunction } from '@aws-amplify/backend';

export const review = defineFunction({
  name: 'review',
  entry: './handler.ts'
});