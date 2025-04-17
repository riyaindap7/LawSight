"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", user.displayName || user.email || "User");
      } else {
        setUser(null);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (user: User) => {
    setUser(user);
    router.push("/"); // Redirect to home page
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/loginSignup"); // Redirect to login/signup page
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
