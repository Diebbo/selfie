"use server";
import { getNotes } from "@/actions/notes";
import Content from "@/components/notes/content";
// import { getSettings } from '@/actions/pomodoro';

const Page = async () => {
  /*
   * TODO: fetch settings and the time remaining from the server
   * and pass them as props to the Content component
   * cosnt settings: PomodoroSettings = getSettings();
   * <Content setting={settings} timeLeft={timeLeft} />
   */

  try {
    const notes = await getNotes();
    return <Content notes={notes} />;
  } catch (e) {
    console.log(e);
  }
};

export default Page;
