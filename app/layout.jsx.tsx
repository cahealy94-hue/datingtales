export const metadata = {
  title: "Date & Tell — Love, Anonymous.",
  description: "Anonymous dating stories, delivered every Friday. Funny, cringey, sweet. Date & Tell.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
