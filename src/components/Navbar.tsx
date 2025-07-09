
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { logOut } from '@/firebase/auth';
import { LayoutDashboard, Video, PlusCircle, LogOut, UserCircle, Gem, Sun, Moon, Home, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      // Failed to log out
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="mr-4 flex items-center space-x-2">
          <Gem className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg sm:text-xl">Videomatics AI</span>
        </Link>
        
        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Link href="/" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm font-medium px-3">
                <Home className="mr-1 h-4 w-4" />
                Home
              </Button>
            </Link>
            {user && (
              <>
                <Link href="/dashboard" legacyBehavior passHref>
                  <Button variant="ghost" className="text-sm font-medium px-3">
                    <LayoutDashboard className="mr-1 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/generate" legacyBehavior passHref>
                  <Button variant="ghost" className="text-sm font-medium px-3">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Create
                  </Button>
                </Link>
                <Link href="/videos" legacyBehavior passHref>
                   <Button variant="ghost" className="text-sm font-medium px-3">
                      <Video className="mr-1 h-4 w-4" />
                      My Videos
                  </Button>
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="h-9 w-9"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                      <AvatarFallback>{user.email ? user.email[0].toUpperCase() : <UserCircle className="h-4/5 w-4/5" />}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{user.displayName || user.email || 'User'}</p>
                      {user.displayName && user.email && <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" legacyBehavior passHref>
                <Button size="sm" className="px-3 text-sm sm:px-4">Login</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] flex flex-col p-0">
              <div className="p-4 border-b">
                 <SheetClose asChild>
                   <Link href="/" className="flex items-center space-x-2">
                      <Gem className="h-6 w-6 text-primary" />
                      <span className="font-bold font-headline text-lg">Videomatics AI</span>
                    </Link>
                  </SheetClose>
              </div>
              <nav className="flex flex-col p-4 space-y-1 flex-1">
                <SheetClose asChild>
                  <Link href="/" legacyBehavior passHref>
                    <Button variant="ghost" className="justify-start text-base font-medium w-full">
                      <Home className="mr-2 h-5 w-5" /> Home
                    </Button>
                  </Link>
                </SheetClose>
                {user && (
                  <>
                    <SheetClose asChild>
                      <Link href="/dashboard" legacyBehavior passHref>
                        <Button variant="ghost" className="justify-start text-base font-medium w-full">
                          <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/generate" legacyBehavior passHref>
                        <Button variant="ghost" className="justify-start text-base font-medium w-full">
                          <PlusCircle className="mr-2 h-5 w-5" /> Create
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                       <Link href="/videos" legacyBehavior passHref>
                         <Button variant="ghost" className="justify-start text-base font-medium w-full">
                            <Video className="mr-2 h-5 w-5" /> My Videos
                        </Button>
                      </Link>
                    </SheetClose>
                  </>
                )}
              </nav>
              <div className="p-4 border-t flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                    {user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-full w-full">
                              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                              <AvatarFallback>{user.email ? user.email[0].toUpperCase() : <UserCircle />}</AvatarFallback>
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                          <DropdownMenuLabel className="font-normal">
                             <p className="text-sm font-medium leading-none truncate">{user.displayName || user.email || 'User'}</p>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/login" legacyBehavior passHref>
                          <Button size="sm" className="w-full">Login</Button>
                        </Link>
                      </SheetClose>
                    )}
                 </div>
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
