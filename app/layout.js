import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";

export const metadata = {
  title: "SB Place | Revenda Specialized em Tubarão, SC",
  description:
    "SB Place, revenda autorizada Specialized em Tubarão, SC. Bikes novas com nota fiscal e garantia, e seminovas de alto padrão revisadas e enviadas para todo o Brasil.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
