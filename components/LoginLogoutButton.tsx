"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const LoginButton = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (isMounted) setUser(user);
    };
    fetchUser();
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth] onAuthStateChange', { event, hasSession: !!session });
      setUser(session?.user ?? null);
    });
    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);
  
  if (user) {
    return (
      <Button
        onClick={() => {
          console.log('[auth] Sign out click');
          supabase.auth.signOut().then(({ error }) => {
            if (error) console.error('[auth] Sign out error', error.message);
            else console.log('[auth] Signed out');
          });
        }}
      >
        Log out
      </Button>
    );
  }
  
  return (
    <Button
      variant="outline"
      onClick={() => {
        // Store the intended redirect destination before navigating to login
        localStorage.setItem('post_oauth_redirect', '/list-software');
        router.push("/login?redirect=/list-software");
      }}
    >
      List Your Software
    </Button>
  );
};

export default LoginButton;