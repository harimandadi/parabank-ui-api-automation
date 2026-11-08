export const randomString = (prefix = 'user'): string =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
