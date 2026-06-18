"use client";

import Link from "next/link";
import { translations } from "@/lib/i18n";

const t = translations.zh;

export default function ChineseHomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center max-w-3xl">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            {t.homepage.title}
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            {t.homepage.subtitle}
          </p>
          
          <Link
            href="/zh/upload"
            className="inline-block bg-primary-600 text-white text-lg px-8 py-4 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg"
          >
            {t.homepage.uploadButton}
          </Link>
          
          <p className="mt-4 text-sm text-gray-500">
            {t.homepage.supportInfo}
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">{t.homepage.feature1Title}</div>
            <h3 className="text-xl font-semibold mb-2">{t.homepage.feature1Title}</h3>
            <p className="text-gray-600">
              {t.homepage.feature1Desc}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">{t.homepage.feature2Title}</div>
            <h3 className="text-xl font-semibold mb-2">{t.homepage.feature2Title}</h3>
            <p className="text-gray-600">
              {t.homepage.feature2Desc}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">{t.homepage.feature3Title}</div>
            <h3 className="text-xl font-semibold mb-2">{t.homepage.feature3Title}</h3>
            <p className="text-gray-600">
              {t.homepage.feature3Desc}
            </p>
          </div>
        </div>

        {/* Supported Types */}
        <div className="mt-16">
          <p className="text-gray-500 mb-4">{t.homepage.contractTypes}</p>
          <div className="flex gap-4">
            <span className="px-4 py-2 bg-gray-100 rounded-full">{t.homepage.laborContract}</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">{t.homepage.serviceContract}</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full">{t.homepage.nda}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm border-t">
        <p>{t.homepage.footer}</p>
      </footer>
    </main>
  );
}
