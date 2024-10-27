"use client";
import { PomodoroStats } from "@/helpers/types";
import { Card, CardBody } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FcAlarmClock, FcReading } from "react-icons/fc";

interface PomodoroStatisticsProps {
  stats: PomodoroStats;
}

export const PomodoroStatistics = (props: PomodoroStatisticsProps) => {
  const [stats, setStats] = useState<PomodoroStats>(props.stats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/pomodoro/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        props.stats = data;
        setStats(data);
      } catch (error) {
        console.error("Error fetching pomodoro stats:", error);
      }
    };

    fetchStats();
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="bg-sky-100 dark:bg-sky-950 shadow-sm">
      <CardBody>
        <h3 className="text-xl font-semibold mb-4">Pomodoro Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-success/10 rounded-lg">
            <FcReading className="text-3xl mb-2" />
            <span className="text-sm text-default-600">Total Study Time</span>
            <span className="text-2xl font-bold text-success">
              {stats ? formatTime(stats.totalStudyTime) : "Loading..."}
            </span>
          </div>
          <div className="flex flex-col items-center p-4 bg-warning/10 rounded-lg">
            <FcAlarmClock className="text-3xl mb-2" />
            <span className="text-sm text-default-600">Total Break Time</span>
            <span className="text-2xl font-bold text-warning">
              {stats ? formatTime(stats.totalBreakTime) : "Loading..."}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
