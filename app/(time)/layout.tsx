import { TimeLayoutWrapper } from "@/components/timemachine/timeLayout";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // return <TimeMachineWrapper>{children}</TimeMachineWrapper>;
  return <TimeLayoutWrapper>{children}</TimeLayoutWrapper>;
}
