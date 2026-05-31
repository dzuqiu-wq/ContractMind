import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansSC = Noto_Sans_SC({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sc"
});

export const metadata: Metadata = {
  title: "ContractMind - AI Contract Risk Review",
  description: "Upload your contract and get AI-powered risk analysis in minutes. AI智能合同风险审查",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSansSC.variable}`}>
        {children}
      </body>
    </html>
  );
}
