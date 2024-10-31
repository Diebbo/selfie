import { Layout } from "@/components/layout/layout";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { getCurrentTime } from "@/actions/setTime";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentTime = await getCurrentTime();

  return <Layout currentTime={currentTime}>{children}</Layout>;
}