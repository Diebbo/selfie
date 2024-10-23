import { Layout } from "@/components/layout/layout";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
