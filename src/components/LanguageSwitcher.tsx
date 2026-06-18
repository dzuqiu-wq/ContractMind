"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  
  // Extract current path without language prefix
  const getPathWithoutLang = () => {
    if (pathname.startsWith("/en")) {
      return pathname.replace(/^\/en/, "") || "/";
    }
    if (pathname.startsWith("/zh")) {
      return pathname.replace(/^\/zh/, "") || "/";
    }
    return pathname;
  };
  
  const cleanPath = getPathWithoutLang();
  
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/en${cleanPath}`}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          pathname.startsWith("/en") 
            ? "bg-primary-100 text-primary-700" 
            : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        EN
      </Link>
      <Link
        href={`/zh${cleanPath}`}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          pathname.startsWith("/zh") 
            ? "bg-primary-100 text-primary-700" 
            : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        中文
      </Link>
    </div>
  );
}
