"use client";

/**
 * TabNav — client component (needs usePathname to build hrefs).
 *
 * URL-driven tabs. Each tab is a plain anchor tag that sets ?tab=<key>.
 * No useState, no client-side routing state.
 */

import { usePathname } from "next/navigation";
import { MessageCircle, BookOpen, Tag, Settings } from "lucide-react";

interface Props {
  workspaceId: string;
  activeTab: string;
}

const TABS = [
  { key: "conversations", label: "Conversations", icon: MessageCircle },
  { key: "knowledge", label: "Knowledge base", icon: BookOpen },
  { key: "intents", label: "Intents", icon: Tag },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

export function TabNav({ workspaceId, activeTab }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-0.5 border-b"
      style={{ borderColor: "var(--border-subtle)" }}
      aria-label="Workspace tabs"
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        const href = `${pathname}?tab=${key}`;

        return (
          <a
            key={key}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
            style={
              isActive
                ? {
                    borderBottomColor: "#22c55e",
                    color: "#22c55e",
                  }
                : {
                    borderBottomColor: "transparent",
                    color: "var(--text-muted)",
                  }
            }
          >
            <Icon size={13} />
            {label}
          </a>
        );
      })}
    </nav>
  );
}
