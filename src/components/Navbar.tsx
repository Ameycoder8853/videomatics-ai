
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
import { LayoutDashboard, Video, PlusCircle, LogOut, UserCircle, Gem, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes'; // For dark mode toggle

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <Gem className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-xl">VividVerse</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-2 md:space-x-4">
          <Link href="/dashboard" legacyBehavior passHref>
            <Button variant="ghost" className="text-sm font-medium px-2 md:px-3">
              <LayoutDashboard className="mr-1 md:mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/generate" legacyBehavior passHref>
            <Button variant="ghost" className="text-sm font-medium px-2 md:px-3">
              <PlusCircle className="mr-1 md:mr-2 h-4 w-4" />
              Create
            </Button>
          </Link>
          <Link href="/videos" legacyBehavior passHref>
             <Button variant="ghost" className="text-sm font-medium px-2 md:px-3">
                <Video className="mr-1 md:mr-2 h-4 w-4" />
                My Videos
            </Button>
          </Link>
        </nav>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback>{user.email ? user.email[0].toUpperCase() : <UserCircle />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
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
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
