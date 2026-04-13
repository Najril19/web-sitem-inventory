import type { Metadata } from 'next';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'El-Hibbani — Sistem Inventori',
  description: 'Sistem Inventori Toko El-Hibbani',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
