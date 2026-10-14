import "./globals.css";
export const metadata = { title: "Alibi: a daily deduction case", description: "Four are telling the truth. One is lying." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
