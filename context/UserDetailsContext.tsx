"use client";
import { createContext } from "react";
import { UserDetails } from "@/app/provider";

type UserDetailsContextType = UserDetails & {
  setuserdetil: React.Dispatch<React.SetStateAction<UserDetails | undefined>>;
};

export const UserDetailsContext = createContext<UserDetailsContextType | null>(null);
