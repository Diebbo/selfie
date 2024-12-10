import { useState, useEffect, useRef } from "react";
import { PomodoroSettings } from "@/helpers/types";

interface TimerState {
  focusTime: number;
  breakTime: number;
  longBreakTime: number;
  timeLeft: number;
  isRunning: boolean;
  sessionType: "focus" | "shortBreak" | "longBreak";
  sessionCount: number;
  percentage: number;
  waveHeight: number;
}

const usePomodoroTimer = (settings: PomodoroSettings) => {
  const initialState: TimerState = {
    focusTime: settings.studyDuration,
    breakTime: settings.shortBreakDuration,
    longBreakTime: settings.longBreakDuration,
    timeLeft: settings.studyDuration * 60,
    isRunning: false,
    sessionType: "focus",
    sessionCount: 0,
    percentage: 100,
    waveHeight: 0,
  };
  const [state, setState] = useState<TimerState>(initialState);
  const initialHeight = useRef(0);
  const lastMinuteSent = useRef<number>(Math.floor(state.timeLeft / 60));
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    initialHeight.current = height - 130;
    const totalTime = getTotalTime();
    const progress = state.timeLeft / totalTime;

    // update percentage every 1% for circular progress bar
    if (Math.abs(state.percentage - progress * 100) >= 1) {
      setState((prev) => ({
        ...prev,
        percentage: progress * 100,
      }));
    }

    // update wave height for wave animation
    setState((prev) => ({
      ...prev,
      waveHeight: initialHeight.current * progress,
    }));

    // timer update every 30ms to make animation smooth
    let interval: NodeJS.Timeout;
    if (state.isRunning && state.timeLeft > 0) {
      interval = setInterval(() => {
        setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 0.03 }));
      }, 30);
    } else if (state.timeLeft <= 0) {
      updateStats();
      handleToggleSession();
    }

    window.onresize = () => setHeight(window.innerHeight);

    return () => {
      clearInterval(interval);
      window.onresize = null;
    };
  }, [state.isRunning, state.timeLeft, height]);

  // get the total time of current session
  const getTotalTime = () => {
    const { sessionType, focusTime, breakTime, longBreakTime } = state;
    return sessionType === "focus"
      ? focusTime * 60
      : sessionType === "shortBreak"
        ? breakTime * 60
        : longBreakTime * 60;
  };

  // Toggle between focus, short break, and long break
  const handleToggleSession = () => {
    setState((prev) => {
      const newState = { ...prev };
      if (prev.sessionType === "focus") {
        const newCount = prev.sessionCount + 1;
        if (newCount >= 2) {
          newState.sessionType = "longBreak";
          newState.timeLeft = prev.longBreakTime * 60;
          newState.sessionCount = 0;
        } else {
          newState.sessionType = "shortBreak";
          newState.timeLeft = prev.breakTime * 60;
          newState.sessionCount = newCount;
        }
      } else {
        newState.sessionType = "focus";
        newState.timeLeft = prev.focusTime * 60;
      }
      newState.waveHeight = initialHeight.current;

      return newState;
    });
  };

  const updateStats = () => {
    const statsData = {
      pomodoro: {
        incStudyTime: state.sessionType === "focus" ? state.focusTime : 0,
        incBreakTime:
          state.sessionType === "focus"
            ? 0
            : state.sessionType === "shortBreak"
              ? state.breakTime
              : state.longBreakTime,
      },
    };

    fetch("/api/pomodoro/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statsData),
    });
  };

  const toggleRunning = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleReset = (newSettings: PomodoroSettings) => {
    setState({
      ...initialState,
      waveHeight: initialHeight.current,
      focusTime: newSettings.studyDuration,
      breakTime: newSettings.shortBreakDuration,
      longBreakTime: newSettings.longBreakDuration,
      timeLeft: newSettings.studyDuration * 60,
    });
  };

  return {
    state,
    toggleRunning: toggleRunning,
    toggleSession: handleToggleSession,
    reset: handleReset,
  };
};

export default usePomodoroTimer;
