import './globals.css';
import TabBar from '@/components/TabBar';

export const metadata = {
  title: 'PlainSlang: Parent Guide — Modern Slang in Plain English',
  description:
    'PlainSlang — know what your kids mean. A free, no-login guide that translates teen and Gen Alpha slang into plain English: 670+ documented terms with published sources, organized by age group, plus texting, gaming, coding, corporate, safety, and emoji packs with a daily-verified trending list.',
  applicationName: 'PlainSlang',
  keywords: ['teen slang', 'parent guide', 'Gen Alpha slang', 'slang dictionary', 'texting acronyms', 'emoji meanings'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d12',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-frame">
          {children}
          <TabBar />
        </div>
      </body>
    </html>
  );
}
