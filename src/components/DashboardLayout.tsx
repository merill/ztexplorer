import { useState, useCallback } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { pillarConfigs } from '@/pillarConfig';
import { useTheme } from '@/hooks/useTheme';

export default function DashboardLayout() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-64'
        }`}
      >
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-3 px-3 py-4 min-h-[56px] hover:bg-sidebar-accent transition-colors">
          <img src="/microsoft-logo.svg" alt="" className="h-6 w-6 shrink-0" />
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <div className="text-sm font-semibold whitespace-nowrap">Zero Trust</div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                Framework Explorer
              </div>
            </div>
          )}
        </Link>

        <Separator />

        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {/* Overview link */}
            <NavLink
              to="/"
              end
              title="Overview"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-0' : ''
                } ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              {!collapsed && 'Overview'}
            </NavLink>

            {!collapsed && (
              <div className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mind Maps
              </div>
            )}

            {collapsed && <Separator className="my-2" />}

            {pillarConfigs.map((pillar) => (
              <NavLink
                key={pillar.id}
                to={`/pillar/${pillar.id}`}
                title={pillar.name}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    collapsed ? 'justify-center px-0' : ''
                  } ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`
                }
              >
                <img src={`/icons/${pillar.icon}`} alt="" className="h-4 w-4 shrink-0" />
                {!collapsed && pillar.name}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className="flex flex-col gap-1 p-2">
          {!collapsed && (
            <a
              href="https://zerotrust.microsoft.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              zerotrust.microsoft.com
            </a>
          )}
          {collapsed && (
            <a
              href="https://zerotrust.microsoft.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="zerotrust.microsoft.com"
              className="flex items-center justify-center rounded-md py-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className={`gap-3 ${collapsed ? 'justify-center px-0' : 'justify-start px-3'}`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!collapsed && (theme === 'dark' ? 'Light mode' : 'Dark mode')}
          </Button>

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`gap-3 ${collapsed ? 'justify-center px-0' : 'justify-start px-3'}`}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronLeft className="h-4 w-4 shrink-0" />
            )}
            {!collapsed && 'Collapse'}
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-sidebar">
          <Link to="/" className="flex items-center gap-2">
            <img src="/microsoft-logo.svg" alt="" className="h-5 w-5" />
            <span className="text-sm font-semibold">Zero Trust Explorer</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggle}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden flex border-b overflow-x-auto bg-background">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `shrink-0 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
              }`
            }
          >
            Overview
          </NavLink>
          {pillarConfigs.map((p) => (
            <NavLink
              key={p.id}
              to={`/pillar/${p.id}`}
              className={({ isActive }) =>
                `shrink-0 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                }`
              }
            >
              {p.name}
            </NavLink>
          ))}
        </div>

        {/* Page content */}
        <main className="flex-1 min-h-0 overflow-auto" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
