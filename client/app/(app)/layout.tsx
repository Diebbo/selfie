"use server";
import { Layout } from "@/components/layout/layout";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import { getCurrentTime } from "@/actions/setTime";
import { ReloadProvider } from "@/components/calendar/contextStore";
import { TimeProvider } from "@/components/contexts/TimeContext";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentTime = await getCurrentTime();

  return (
    <TimeProvider initialTime={currentTime}>
      <ReloadProvider>
        <Layout>{children}</Layout>
      </ReloadProvider>
    </TimeProvider>
  );
}
