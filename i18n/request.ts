import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';
import { cookies } from 'next/headers';

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export default getRequestConfig(async (params) => {
  let locale = defaultLocale;
  // Try to get locale from cookie
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log('i18n request: all cookies', allCookies.map(c => ({ name: c.name, value: c.value })));
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  console.log('i18n request: cookieLocale', cookieLocale);
  if (cookieLocale && isLocale(cookieLocale)) {
    locale = cookieLocale;
  }
  // If locale is provided via params (e.g., from getTranslations), use it
  if (params.locale && isLocale(params.locale)) {
    locale = params.locale;
  }
  console.log('i18n request: final locale', locale);
  // Fallback to default locale
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
