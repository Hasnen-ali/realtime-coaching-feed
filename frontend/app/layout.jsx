import './globals.css';

export const metadata = {
  title: 'Realtime Coaching Feed',
  description: 'Live coaching updates powered by Express, MongoDB, Redis, Socket.IO, and Next.js.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
