import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansSC = Noto_Sans_SC({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sc"
});

export const metadata: Metadata = {
  title: "ContractMind - AI Contract Risk Review",
  description: "Upload your contract and get AI-powered risk analysis in minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={`${inter.variable} ${notoSansSC.variable}`}>
        <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-primary-600">ContractMind</h1>
          <nav className="flex gap-6 items-center">
            <LanguageSwitcher />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
