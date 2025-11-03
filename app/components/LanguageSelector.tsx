"use client";

import { useLocale } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useState, useTransition } from "react";

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (newLocale: Locale) => {
    startTransition(async () => {
      // Set cookie
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year

      // Save dialog state to reopen after reload
      localStorage.setItem('granboard_reopen_settings', 'true');

      // Refresh the page to apply the new locale
      window.location.reload();
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-all flex items-center gap-2"
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
          <div className="absolute right-0 top-full mt-2 z-50 bg-slate-700 rounded-lg shadow-xl border border-slate-600 overflow-hidden min-w-[150px]">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => changeLanguage(loc)}
                disabled={isPending}
                className={`w-full px-4 py-3 text-left transition-all flex items-center gap-3 ${
                  locale === loc
                    ? "bg-slate-600 text-white font-medium"
                    : "text-slate-300 hover:bg-slate-600"
                }`}
              >
                <span className="uppercase text-sm font-bold text-slate-400">
                  {loc}
                </span>
                <span className="flex-1">{localeNames[loc]}</span>
                {locale === loc && (
                  <svg
                    className="w-5 h-5 text-green-400"
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
