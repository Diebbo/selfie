"use server";
import { getSettings } from "@/actions/pomodoro";
import Content from "@/components/pomodoro/content";
// import { getSettings } from '@/actions/pomodoro';

const Page = async () => {
  /*
   * TODO: fetch settings and the time remaining from the server
   * and pass them as props to the Content component
   * cosnt settings: PomodoroSettings = getSettings();
   * <Content setting={settings} timeLeft={timeLeft} />
   */

  try {
    const settings = await getSettings();
    return <Content settings={settings} />;
  } catch (e) {
    console.log(e);
  }
};

export default Page;
