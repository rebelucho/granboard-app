import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export default getRequestConfig(async (params) => {
  let locale = defaultLocale;
  
  // Skip reading cookies during static build to avoid dynamic rendering errors
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    // Dynamically import cookies to avoid static analysis marking the route as dynamic
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
    console.log('i18n request: cookieLocale =', cookieLocale);
    if (cookieLocale && isLocale(cookieLocale)) {
      locale = cookieLocale;
    }
  } else {
    console.log('i18n request: skipping cookie read because NEXT_PHASE =', process.env.NEXT_PHASE);
  }
  
  // If locale is provided via params (e.g., from getTranslations), use it
  if (params.locale && isLocale(params.locale)) {
    locale = params.locale;
  }
  
  console.log('i18n request: final locale =', locale);
  // Fallback to default locale
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
