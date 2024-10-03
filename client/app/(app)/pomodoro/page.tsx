'use server';
import Content from '@/components/pomodoro/content';
// import { getSettings } from '@/actions/pomodoro';

const Page = () => {
  /*
    * TODO: fetch settings and the time remaining from the server
    * and pass them as props to the Content component
    * cosnt settings: PomodoroSettings = getSettings();
    * <Content setting={settings} timeLeft={timeLeft} />
  */
  return <Content />
};

export default Page;
