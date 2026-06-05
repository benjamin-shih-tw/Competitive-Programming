import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSES Solution Portal | Notion & GitHub Sync',
  description: 'Automatically sync your competitive programming C++ solutions from GitHub with detailed explanations written in Notion.',
  keywords: ['CSES', 'Competitive Programming', 'Notion Sync', 'C++', 'Data Structures', 'Algorithms'],
  authors: [{ name: 'Benjamin Shih' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
