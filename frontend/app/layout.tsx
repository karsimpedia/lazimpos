export const metadata = { title: "POS Kasir Starter" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "sans-serif", margin: 0 }}>
        <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <b>POS Kasir</b> — Demo
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </body>
    </html>
  );
}
