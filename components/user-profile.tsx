'use client';

import React, { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signOut } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import {
  SignOut,
  SignIn,
  UserCircle,
  Bookmark,
  Eye,
  EyeSlash,
  Info,
  FileText,
  Shield,
  GithubLogo,
  Bug,
  Sun,
  Crown,
  Lightning,
  Gear,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from './theme-switcher';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { XLogo, InstagramLogoIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { User } from '@/lib/db/schema';
import { ShieldAlert, DollarSign } from 'lucide-react';

const VercelIcon = ({ size = 16 }: { size: number }) => {
  return (
    <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size} style={{ color: 'currentcolor' }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1L16 15H0L8 1Z" fill="currentColor"></path>
    </svg>
  );
};

// Update the component to use memo
const UserProfile = memo(
  ({
    className,
    user,
    subscriptionData,
    isProUser,
    isProStatusLoading,
  }: {
    className?: string;
    user?: User | null;
    subscriptionData?: any;
    isProUser?: boolean;
    isProStatusLoading?: boolean;
  }) => {
    const [signingOut, setSigningOut] = useState(false);
    const [signingIn, setSigningIn] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const { data: session, isPending } = useSession();
    const router = useRouter();

    // Use passed user prop if available, otherwise fall back to session
    const currentUser = user || session?.user;
    const isAuthenticated = !!(user || session);

    // Use passed Pro status instead of calculating it
    const hasActiveSubscription = isProUser;

    if (isPending && !user) {
      return (
        <div className="h-8 w-8 flex items-center justify-center">
          <div className="size-4 rounded-full bg-muted/50 animate-pulse"></div>
        </div>
      );
    }

    // Function to format email for display
    const formatEmail = (email?: string | null) => {
      if (!email) return '';

      // If showing full email, don't truncate it
      if (showEmail) {
        return email;
      }

      // If hiding email, show only first few characters and domain
      const parts = email.split('@');
      if (parts.length === 2) {
        const username = parts[0];
        const domain = parts[1];
        const maskedUsername = username.slice(0, 3) + '•••';
        return `${maskedUsername}@${domain}`;
      }

      // Fallback for unusual email formats
      return email.slice(0, 3) + '•••';
    };

    return (
      <>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('p-0! m-0!', signingOut && 'animate-pulse', className)}
                  asChild
                >
                  <ShieldAlert size={22} strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              {isAuthenticated ? 'Account' : 'Alert'}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="w-[240px] z-[110] mr-5">
            {/* User Info Section - commented out */}
            {/* {isAuthenticated ? (
              <div className="p-3"> ... </div>
            ) : (
              <div className="p-3"> ... </div>
            )} */}
            {/* <DropdownMenuSeparator /> */}

            {/* Subscription Status - commented out */}
            {/* {isAuthenticated && ( ... )} */}

            {isAuthenticated && (
              <>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/settings" className="w-full flex items-center gap-2">
                    <Gear size={16} />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            {/* Theme switcher - commented out */}
            {/* <DropdownMenuItem className="cursor-pointer py-1 hover:bg-transparent!">
              <div className="flex items-center justify-between w-full px-0" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Sun size={16} />
                  <span className="text-sm">Theme</span>
                </div>
                <ThemeSwitcher />
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}

            {/* About and Information */}
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/about" className="w-full flex items-center gap-2">
                <Info size={16} />
                <span>About</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/terms" className="w-full flex items-center gap-2">
                <FileText size={16} />
                <span>Terms</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/privacy-policy" className="w-full flex items-center gap-2">
                <Shield size={16} />
                <span>Privacy</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Social and External Links */}
            {/* <DropdownMenuItem className="cursor-pointer" asChild>
              <a
                href={'https://git.new/scira'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2"
              >
                <GithubLogo size={16} />
                <span>Github</span>
              </a>
            </DropdownMenuItem> */}
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a
                href="#"
                className="w-full flex items-center gap-2"
              >
                <XLogo size={16} />
                <span>X.com</span>
              </a>
            </DropdownMenuItem>
            {/* <DropdownMenuItem className="cursor-pointer" asChild>
              <a
                href={'https://www.instagram.com/scira.ai'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2"
              >
                <InstagramLogoIcon size={16} />
                <span>Instagram</span>
              </a>
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem className="cursor-pointer" asChild>
              <a
                href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzaidmukaddam%2Fscira&env=XAI_API_KEY,OPENAI_API_KEY,ANTHROPIC_API_KEY,GROQ_API_KEY,GOOGLE_GENERATIVE_AI_API_KEY,DAYTONA_API_KEY,E2B_API_KEY,DATABASE_URL,BETTER_AUTH_SECRET,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,TWITTER_CLIENT_ID,TWITTER_CLIENT_SECRET,REDIS_URL,ELEVENLABS_API_KEY,TAVILY_API_KEY,EXA_API_KEY,TMDB_API_KEY,YT_ENDPOINT,FIRECRAWL_API_KEY,OPENWEATHER_API_KEY,SANDBOX_TEMPLATE_ID,GOOGLE_MAPS_API_KEY,MAPBOX_ACCESS_TOKEN,AVIATION_STACK_API_KEY,CRON_SECRET,BLOB_READ_WRITE_TOKEN,MEM0_API_KEY,MEM0_ORG_ID,MEM0_PROJECT_ID,SMITHERY_API_KEY,NEXT_PUBLIC_MAPBOX_TOKEN,NEXT_PUBLIC_POSTHOG_KEY,NEXT_PUBLIC_POSTHOG_HOST,NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,SCIRA_PUBLIC_API_KEY,NEXT_PUBLIC_SCIRA_PUBLIC_API_KEY&envDescription=API%20keys%20and%20configuration%20required%20for%20Scira%20to%20function"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2"
              >
                <VercelIcon size={14} />
                <span>Deploy with Vercel</span>
              </a>
            </DropdownMenuItem> */}
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a
                href="#"
                className="w-full flex items-center gap-2"
              >
                <Bug className="size-4" />
                <span>Feature/Bug Request</span>
              </a>
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}

            {/* Custom Section: AI Dex Explorer, LCX, Tiamonds, Buy TOTO, Swap */}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a href="#" className="w-full flex items-center gap-2">
                <DollarSign size={16} />
                <span>AI Dex Explorer</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a href="#" className="w-full flex items-center gap-2">
                <DollarSign size={16} />
                <span>LCX</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a href="#" className="w-full flex items-center gap-2">
                <DollarSign size={16} />
                <span>Tiamonds</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a href="#" className="w-full flex items-center gap-2">
                <DollarSign size={16} />
                <span>Buy TOTO</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a href="#" className="w-full flex items-center gap-2">
                <DollarSign size={16} />
                <span>Swap</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  },
);

// Add a display name for the memoized component for better debugging
UserProfile.displayName = 'UserProfile';

export { UserProfile };
