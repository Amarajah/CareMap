import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalLayout from '@/components/conditionalLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CareMap',
  description: 'Connecting you to quality healthcare, everywhere',
  icons: {
    icon: './favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}