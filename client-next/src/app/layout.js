import './globals.css';
import ConditionalLayout from '@/components/conditionalLayout';

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
      <body style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}