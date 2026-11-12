import "./globals.css";
export const metadata = { title: "Salary Calculator – HR", description: "HR salary calculation dashboard" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
