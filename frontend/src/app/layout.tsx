'use client';

import './globals.css';
import './footer-styles.css';
import './cta-section.css';
import './button-fix.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Layout from '@/components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Layout>{children}</Layout>
            <ToastContainer position="bottom-right" autoClose={3000} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
