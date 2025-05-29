// components/DashboardLayout.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  CheckSquare, 
  Target, 
  Repeat, 
  BookOpen, 
  MessageSquare,
  Settings,
  Menu,
  X,
  Clock,
  Bell,
  Search
} from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { useSession, signOut } from 'next-auth/react'
import { ModeToggle } from '@/app/components/ModeToggle'
import { NotificationBell } from '@/app/components/NotificationBell'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Habits', href: '/dashboard/habits', icon: Repeat },
  { name: 'Routines', href: '/dashboard/routines', icon: Clock },
  { name: 'Journal', href: '/dashboard/journal', icon: BookOpen },
  { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
        <button
          className="p-2.5 -m-2.5 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
              type="search"
            />
          </div>
          <div className="flex items-center gap-x-4">
            <NotificationBell />
            <ModeToggle />
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <h1 className="text-2xl font-bold">LifePilot</h1>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold hover:bg-accent hover:text-accent-foreground transition-colors',
                            pathname === item.href
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'h-6 w-6 shrink-0',
                              pathname === item.href
                                ? 'text-accent-foreground'
                                : 'text-muted-foreground group-hover:text-accent-foreground'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <Link
                    href="/dashboard/settings"
                    className={cn(
                      'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:bg-accent hover:text-accent-foreground transition-colors',
                      pathname === '/dashboard/settings'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Settings
                      className={cn(
                        'h-6 w-6 shrink-0',
                        pathname === '/dashboard/settings'
                          ? 'text-accent-foreground'
                          : 'text-muted-foreground group-hover:text-accent-foreground'
                      )}
                      aria-hidden="true"
                    />
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="relative z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-background/80"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-background px-6 pb-4 border-r">
              <div className="flex h-16 shrink-0 items-center justify-between">
                <h1 className="text-2xl font-bold">LifePilot</h1>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold hover:bg-accent hover:text-accent-foreground transition-colors',
                              pathname === item.href
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            <item.icon
                              className={cn(
                                'h-6 w-6 shrink-0',
                                pathname === item.href
                                  ? 'text-accent-foreground'
                                  : 'text-muted-foreground group-hover:text-accent-foreground'
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="mt-auto">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:bg-accent hover:text-accent-foreground transition-colors',
                        pathname === '/dashboard/settings'
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      <Settings
                        className={cn(
                          'h-6 w-6 shrink-0',
                          pathname === '/dashboard/settings'
                            ? 'text-accent-foreground'
                            : 'text-muted-foreground group-hover:text-accent-foreground'
                        )}
                        aria-hidden="true"
                      />
                      Settings
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 lg:pl-72">
          {/* Desktop header */}
          <div className="sticky top-0 z-30 hidden h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:flex lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1">
                <Search className="pointer-events-none absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="pl-10 w-full max-w-md px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search tasks, goals, habits..."
                  type="search"
                />
              </div>
              <div className="flex items-center gap-x-4">
                <NotificationBell />
                <ModeToggle />
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="relative h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:ring-2 hover:ring-gray-300 transition-all"
                  >
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ''}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {getInitials(session?.user?.name)}
                      </span>
                    )}
                  </button>

                  {profileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border z-20">
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-medium">{session?.user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                        </div>
                        <div className="border-t">
                          <button
                            onClick={() => {
                              signOut({ callbackUrl: '/' })
                              setProfileMenuOpen(false)
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}