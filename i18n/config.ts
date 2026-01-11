export const locales = ['fr', 'en', 'ru'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ru: 'Русский',
};
