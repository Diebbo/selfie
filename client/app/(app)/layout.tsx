import { Layout } from "@/components/layout/layout";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { getCurrentTime } from "@/actions/setTime";
import { ReloadProvider } from '@/components/calendar/contextStore';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentTime = await getCurrentTime();

  return (
    <ReloadProvider>
      <Layout currentTime={currentTime}>
        {children}
      </Layout>
    </ReloadProvider>
  );

}
