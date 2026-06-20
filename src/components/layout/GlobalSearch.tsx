"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  User, 
  Search,
  LayoutDashboard,
  FileText,
  History,
  HelpCircle,
  LogOut,
  MessageSquare,
  BarChart
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useQueryStore } from "@/stores/queryStore";
import { useAuthStore } from "@/stores/authStore";
import { getReportsAction } from "@/app/(app)/reports/actions";
import type { Report } from "@/types";

export function GlobalSearch({ open, setOpen }: { open: boolean, setOpen: (o: boolean) => void }) {
  const router = useRouter();
  const { history, setQuery } = useQueryStore();
  const { logout } = useAuthStore();
  const [reports, setReports] = React.useState<Report[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  React.useEffect(() => {
    if (open && reports.length === 0) {
      getReportsAction().then((res) => {
        if (res.success && res.reports) {
          setReports(res.reports);
        }
      });
    }
  }, [open, reports.length]);

  const runAction = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runAction(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => router.push("/history"))}>
            <History className="mr-2 h-4 w-4" />
            <span>Query History</span>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => router.push("/reports"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => router.push("/analytics"))}>
            <BarChart className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => router.push("/help"))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runAction(() => {
            setQuery("");
            router.push("/dashboard");
            setTimeout(() => document.getElementById("query-input")?.focus(), 100);
          })}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>New Query...</span>
          </CommandItem>
          <CommandItem onSelect={() => runAction(logout)}>
            <LogOut className="mr-2 h-4 w-4 text-destructive" />
            <span className="text-destructive">Sign Out</span>
          </CommandItem>
        </CommandGroup>

        {history && history.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Queries">
              {history.slice(0, 5).map((item) => (
                <CommandItem 
                  key={item.id} 
                  onSelect={() => runAction(() => {
                    setQuery(item.naturalQuery);
                    router.push("/dashboard");
                  })}
                >
                  <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{item.naturalQuery}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {reports && reports.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Saved Reports">
              {reports.slice(0, 5).map((report) => (
                <CommandItem 
                  key={report.id} 
                  onSelect={() => runAction(() => router.push(`/reports?view=${report.id}`))}
                >
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{report.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        
      </CommandList>
    </CommandDialog>
  );
}
