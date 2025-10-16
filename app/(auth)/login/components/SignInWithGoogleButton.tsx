"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import React from "react";

interface SignInWithGoogleButtonProps {
  redirectTo?: string;
}

const SignInWithGoogleButton: React.FC<SignInWithGoogleButtonProps> = ({ redirectTo = '/' }) => {
  const supabase = createClient();
  
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={async () => {
        console.log('[auth] Google OAuth start', { redirectTo });
        
        // Get the base URL for production
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.carrentallsoftware.com';
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            queryParams: { 
              access_type: "offline", 
              prompt: "consent" 
            },
            redirectTo: `${baseUrl}/auth/confirm/callback?next=${encodeURIComponent(redirectTo)}`,
            skipBrowserRedirect: false,
          },
        });
        
        if (error) {
          console.error('[auth] Google OAuth error', error.message);
        } else {
          // Store in localStorage before redirect (as backup)
          if (redirectTo !== '/') {
            localStorage.setItem('post_oauth_redirect', redirectTo);
          }
          console.log('[auth] Google OAuth redirect initiated');
        }
      }}
    >
      Login with Google
    </Button>
  );
};

export default SignInWithGoogleButton;