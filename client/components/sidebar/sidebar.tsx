"use client";
import React from "react";
import { Sidebar } from "./sidebar.styles";
import { Avatar } from "@nextui-org/react";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { PomodoroIcon } from "../icons/sidebar/pomodoro-icon";
import { NotesIcon } from "../icons/sidebar/notes-icon";
import ChatsIcon from "../icons/sidebar/chats-icon";
import MusicalNoteIcon from "../icons/sidebar/music-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { DevIcon } from "../icons/sidebar/dev-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { useSidebarContext } from "../layout/layout-context";
import { usePathname } from "next/navigation";
import { ProjectsIcon } from "../icons/sidebar/projects-icon";
import { SquareCheckBig, Timer } from 'lucide-react';
import { CalendarIcon } from "../icons/sidebar/calendar-icon";
import Link from "next/link";

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          <Link href="/">
            <div className="flex items-center justify-between p-2">
              <Avatar
                src="/adventurer1.png"
                size="md"
                className="mr-2"
              />
              <h1 className="text-xl font-bold">Selfie App</h1>
            </div>
          </Link>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarItem
              title="Home"
              icon={<HomeIcon />}
              isActive={pathname === "/"}
              href="/"
            />
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={pathname.includes("/calendar")}
                title="Calendar"
                icon={<CalendarIcon />}
                href="/calendar"
              />
              <SidebarItem
                isActive={pathname.includes("/notes")}
                title="Notes"
                icon={<NotesIcon />}
                href="/notes"
              />
              <SidebarItem
                isActive={pathname === "/pomodoro"}
                title="Pomodoro"
                icon={<PomodoroIcon />}
                href="/pomodoro"
              />
              <SidebarItem
                icon={<ProjectsIcon />}
                title="Projects"
                isActive={pathname.includes("/projects")}
                href="/projects"
              />
              <SidebarItem
                isActive={pathname.includes("/chats")}
                title="Chats"
                icon={<ChatsIcon />}
                href="/chats"
              />
              <SidebarItem
                isActive={pathname === "/music-player"}
                title="Music Player"
                icon={<MusicalNoteIcon />}
                href="/music-player"
              />
              <SidebarItem
                isActive={pathname === "/task"}
                title="Task"
                icon={<SquareCheckBig color="#969696" />}
                href="/task"
              />
            </SidebarMenu>

            <SidebarMenu title="General">
              <SidebarItem
                isActive={pathname === "/maps"}
                title="Maps"
                icon={<DevIcon />}
                href="/maps"
              />

              <SidebarItem
                isActive={pathname === "/settings"}
                title="Settings"
                icon={<SettingsIcon />}
                href="/settings"
              />
            </SidebarMenu>

          </div>
        </div>
      </div>
    </aside>
  );
}; import TaskIcon from "../icons/sidebar/task-icon";

