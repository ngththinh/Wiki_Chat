import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
//import custom Query client provider
import ReactQueryProvider from "@/lib/providers/ReactQueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "WikichatbotAI-Hỏi đáp về danh nhân",
  description:
    "WikichatbotAI là một chatbot AI để tìm kiếm thông tin, giải đáp các câu hỏi về danh nhân Việt Nam và trên thế giới.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
