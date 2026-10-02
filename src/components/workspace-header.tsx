import { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Flame,
  GitBranch,
  GraduationCap,
  Layers,
  Menu,
  Settings2,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const navigation = [
  { page: 'today', label: 'Today', icon: GraduationCap, href: '/' },
  { page: 'courses', label: 'My learning', icon: BookOpen, href: '/courses' },
  { page: 'graph', label: 'Knowledge graph', icon: GitBranch, href: '/graph' },
  { page: 'cards', label: 'Flashcards', icon: Layers, href: '/cards' },
  { page: 'lab', label: 'Python lab', icon: Terminal, href: '/lab' },
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
  sync,
  streak,
  pending,
  accountOpen,
}: {
  page: string;
  name: string;
  sync: string;
  streak: number;
  pending: number;
  accountOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const current =
    page === 'learn'
      ? 'Practice'
      : (navigation.find((n) => n.page === page)?.label ?? 'Workspace');
  const active = (target: string) =>
    target === page || (page === 'learn' && target === 'today');
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex h-18 max-w-[1400px] items-center gap-7 px-5 sm:px-8">
          <a
            href="/"
            className="flex shrink-0 items-center gap-2.5 font-heading text-xl font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
              ld
            </span>
            lessdumb<span className="text-primary">.</span>
          </a>
          <NavigationMenu
            aria-label="Main navigation"
            viewport={false}
            className="hidden max-w-none lg:flex"
          >
            <NavigationMenuList className="gap-1">
              {navigation.map((item) => (
                <NavigationMenuItem key={item.page}>
                  <NavigationMenuLink
                    asChild
                    active={active(item.page)}
                    className={`h-9 gap-1.5 px-2 text-xs font-medium ${active(item.page) ? 'bg-primary/8 text-primary' : 'text-muted-foreground'}`}
                  >
                    <a href={item.href}>
                      <item.icon size={16} />
                      {item.label}
                      {item.page === 'cards' && pending > 0 && (
                        <Badge className="ml-1 h-4 px-1 text-[10px]">
                          {pending}
                        </Badge>
                      )}
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="ml-auto lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open navigation"
                  disabled={!interactive}
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>lessdumb</SheetTitle>
                  <SheetDescription>Your learning workspace</SheetDescription>
                </SheetHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="flex flex-col gap-2 px-4"
                >
                  {navigation.map((item) => (
                    <Button
                      key={item.page}
                      asChild
                      variant={active(item.page) ? 'secondary' : 'ghost'}
                      className="justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <a href={item.href}>
                        <item.icon />
                        {item.label}
                      </a>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <div className="mx-auto flex min-h-17 max-w-[1280px] items-center justify-between gap-3 px-5 sm:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:block">
              <BreadcrumbLink href="/">Your workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block">
              <ChevronRight />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex min-w-0 items-center gap-3 text-xs">
          <span className="hidden items-center gap-1.5 text-muted-foreground sm:flex">
            <span className="size-1.5 rounded-full bg-primary" />
            {sync}
          </span>
          <Badge variant="outline" className="hidden gap-1.5 sm:inline-flex">
            <Flame className="size-3.5 text-primary" />
            {streak} day streak
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open account"
            disabled={!interactive}
            onClick={accountOpen}
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-secondary text-xs font-semibold">
                {name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="account-name sr-only">{name}</span>
          </Button>
        </div>
      </div>
    </>
  );
}
