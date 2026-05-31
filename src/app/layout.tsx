import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansSC = Noto_Sans_SC({ 
  subsets: ["latin", "cyrillic", "greek"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sc"
});

export const metadata: Metadata = {
  title: "ContractMind - AI合同风险审查",
  description: "上传合同，AI智能分析风险条款，识别潜在法律风险",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSansSC.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
