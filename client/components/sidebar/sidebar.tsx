"use client";
import React from "react";
import { Sidebar } from "./sidebar.styles";
import { Avatar, Tooltip } from "@nextui-org/react";
import { CompaniesDropdown } from "./companies-dropdown";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { PomodoroIcon } from "../icons/sidebar/pomodoro-icon";
import { BalanceIcon } from "../icons/sidebar/balance-icon";
import { NotesIcon } from "../icons/sidebar/notes-icon";
import ChatsIcon from "../icons/sidebar/chats-icon";
import MusicalNoteIcon from "../icons/sidebar/music-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { DevIcon } from "../icons/sidebar/dev-icon";
import { ViewIcon } from "../icons/sidebar/view-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { CollapseItems } from "./collapse-items";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { FilterIcon } from "../icons/sidebar/filter-icon";
import { useSidebarContext } from "../layout/layout-context";
import { ChangeLogIcon } from "../icons/sidebar/changelog-icon";
import { usePathname } from "next/navigation";
import { ProjectsIcon } from "../icons/sidebar/projects-icon";

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
          <div className="flex items-center justify-between p-2">
            <Avatar
              src="https://i.imgur.com/2LFuJor.jpeg"
              size="md"
              className="mr-2"
            />
            <h1 className="text-xl font-bold">Selfie App</h1>
          </div>
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
                isActive={pathname === "/notes"}
                title="Notes"
                icon={<NotesIcon />}
                href="notes"
              />
              <SidebarItem
                isActive={pathname === "/pomodoro"}
                title="Pomodoro"
                icon={<PomodoroIcon />}
                href="pomodoro"
              />
              <SidebarItem
                icon={<ProjectsIcon />}
                title="Projects"
                isActive={pathname === "/projects"}
                href="projects"
              />
              <SidebarItem
                isActive={pathname === "/chats"}
                title="Chats"
                icon={<ChatsIcon />}
                href="chats"
              />
              <SidebarItem
                isActive={pathname === "/music-player"}
                title="Music Player"
                icon={<MusicalNoteIcon />}
                href="music-player"
              />
              <SidebarItem
                isActive={pathname === "/calendar"}
                title="Calendar"
                icon={<ReportsIcon />}
                href="calendar"
              />
            </SidebarMenu>

            <SidebarMenu title="General">
              <SidebarItem
                isActive={pathname === "/maps"}
                title="Maps"
                icon={<DevIcon />}
                href="maps"
              />

              <SidebarItem
                isActive={pathname === "/settings"}
                title="Settings"
                icon={<SettingsIcon />}
                href="settings"
              />
            </SidebarMenu>

          </div>
        </div>
      </div>
    </aside>
  );
};
