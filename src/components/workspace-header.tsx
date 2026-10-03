import { useEffect, useRef, useState } from 'react';
import {
  GitBranch,
  Layers,
  LogIn,
  LogOut,
  Settings2,
  Terminal,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const tabs = [
  { page: 'today', label: 'Learn', href: '/' },
  { page: 'courses', label: 'Courses', href: '/courses' },
];
const menu = [
  { page: 'graph', label: 'Knowledge graph', icon: GitBranch, href: '/graph' },
  { page: 'cards', label: 'Flashcards', icon: Layers, href: '/cards' },
  { page: 'lab', label: 'Code lab', icon: Terminal, href: '/lab' },
  {
    page: 'settings',
    label: 'Settings & connections',
    icon: Settings2,
    href: '/settings',
  },
];

export function WorkspaceHeader({
  page,
  name,
  email,
  sync,
  pending,
  accountOpen,
  signOut,
}: {
  page: string;
  name: string;
  /** Present only for a signed-in learner. */
  email?: string;
  sync: string;
  pending: number;
  accountOpen: () => void;
  signOut: () => void;
}) {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  // The account dialog opens after the menu returns focus to its trigger, so
  // closing the dialog restores focus there too.
  const openAccountAfterClose = useRef(false);
  const active = (target: string) =>
    target === page || (page === 'learn' && target === 'today');
  return (
    <header className="workspace-header">
      <div className="workspace-header-inner">
        <a href="/" className="workspace-logo" aria-label="lessdumb home">
          <span className="workspace-logo-mark" aria-hidden="true">
            ld
          </span>
          <span className="workspace-logo-name" aria-hidden="true">
            lessdumb
          </span>
        </a>
        <nav aria-label="Main navigation" className="workspace-tabs">
          {tabs.map((tab) => (
            <a
              key={tab.page}
              href={tab.href}
              className="workspace-tab"
              aria-current={active(tab.page) ? 'page' : undefined}
            >
              {tab.label}
            </a>
          ))}
        </nav>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="workspace-avatar"
              aria-label="Account menu"
              disabled={!interactive}
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                  {email ? (
                    name.slice(0, 1).toUpperCase()
                  ) : (
                    <UserRound className="size-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="account-name sr-only">{name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64"
            onCloseAutoFocus={() => {
              if (!openAccountAfterClose.current) return;
              openAccountAfterClose.current = false;
              setTimeout(accountOpen, 0);
            }}
          >
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="truncate font-medium">
                {email ? name : 'Guest'}
              </span>
              {email && (
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              )}
              <span className="text-xs font-normal text-muted-foreground">
                {sync}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menu.map((item) => (
                <DropdownMenuItem key={item.page} asChild>
                  <a
                    href={item.href}
                    aria-current={active(item.page) ? 'page' : undefined}
                  >
                    <item.icon />
                    {item.label}
                    {item.page === 'cards' && pending > 0 && (
                      <Badge className="ml-auto h-4 px-1 text-[10px]">
                        {pending}
                      </Badge>
                    )}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {email ? (
              <>
                <DropdownMenuItem
                  onSelect={() => {
                    openAccountAfterClose.current = true;
                  }}
                >
                  <UserRound />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={signOut}>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onSelect={() => {
                  openAccountAfterClose.current = true;
                }}
              >
                <LogIn />
                Sign in or create account
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
