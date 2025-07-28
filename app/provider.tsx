"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserDetailsContext } from "@/context/UserDetailsContext";

export type UserDetails = {
  name: string;
  email: string;
  credits: number;
  age: number;
};

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { user, isSignedIn } = useUser();
  const { redirectToSignIn } = useClerk();
  const router = useRouter();

  const [userdetails, setuserdetil] = useState<UserDetails | undefined>();

  useEffect(() => {
    if (!isSignedIn) {
      redirectToSignIn();
    } else if (user) {
      axios.post("/api/users")
        .then((res) => {
          console.log("✅ User synced:", res.data); // 👈 Will show in browser console
          setuserdetil(res.data); // 👈 Store received user data
        })
        .catch((error) => {
          console.error("❌ User sync failed:", error);
        });
    }
  }, [isSignedIn, user, redirectToSignIn]);

  return (
    <UserDetailsContext.Provider value={{ ...userdetails, setuserdetil }}>
      {children}
    </UserDetailsContext.Provider>
  );
};

export default Provider;
