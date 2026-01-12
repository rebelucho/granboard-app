"use client";

import { useLocale } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useState, useTransition } from "react";

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (newLocale: Locale) => {
    // Set cookie with minimal attributes
    const cookieString = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    document.cookie = cookieString;
    console.log('LanguageSelector: set cookie for', newLocale);
    console.log('Cookie string:', cookieString);
    console.log('All cookies:', document.cookie);

    // Verify cookie is set
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    console.log('Cookie match:', match ? match[1] : 'none');
    // Also log all cookies as array
    const cookies = document.cookie.split('; ').map(c => c.trim());
    console.log('Cookies array:', cookies);

    // Save dialog state to reopen after reload
    localStorage.setItem('granboard_reopen_settings', 'true');

    // Small delay to ensure cookie is persisted before reload
    console.log('Waiting 100ms before reload...');
    setTimeout(() => {
      console.log('Reloading page...');
      window.location.href = window.location.href;
    }, 100);
  };

  return (
    <div className="relative">
      <button
        data-testid="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="px-4 py-2 bg-theme-interactive text-theme-interactive hover:bg-theme-interactive-hover rounded-lg transition-all flex items-center gap-2"
      >
        <span className="uppercase font-medium">{locale}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div data-testid="language-dropdown" className="absolute right-0 top-full mt-2 z-50 bg-theme-card rounded-lg shadow-xl border border-theme-card overflow-hidden min-w-[150px]">
            {locales.map((loc) => (
              <button
                key={loc}
                data-testid={`language-option-${loc}`}
                onClick={() => changeLanguage(loc)}
                disabled={isPending}
                className={`w-full px-4 py-3 text-left transition-all flex items-center gap-3 ${
                  locale === loc
                    ? "bg-theme-interactive text-theme-primary font-medium"
                    : "text-theme-secondary hover:bg-theme-interactive"
                }`}
              >
                <span className="uppercase text-sm font-bold text-theme-muted">
                  {loc}
                </span>
                <span className="flex-1">{localeNames[loc]}</span>
                {locale === loc && (
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
