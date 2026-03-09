export const metadata = {
  title: "Real Anonymous Dating Stories | Date&Tell",
  description: "Funny, cringey, sweet — real dating stories told anonymously. New stories every Friday.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
