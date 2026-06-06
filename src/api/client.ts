import { create } from 'axios';

export const api = create({
  baseURL: 'https://saavn.sumit.co/api',
  timeout: 10000,
});
