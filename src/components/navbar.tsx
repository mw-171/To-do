"use client";

import React, { useState, useEffect, MouseEvent } from "react";
import {
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
} from "../firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { User } from "firebase/auth";

export const useUserSession = (initialUser?: User) => {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser!);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    onAuthStateChanged((authUser) => {
      if (user === undefined) return;

      // refresh when user changed to ease testing
      if (user?.email !== authUser?.email) {
        router.refresh();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return user!;
};

interface IProps {
  initialUser: User;
}
const Header: React.FC<IProps> = ({ initialUser }) => {
  const user = useUserSession(initialUser);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignIn = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      await signInWithGoogle();
      router.push("/home");
    } catch (error) {
      console.error(error);
    }
  };

  const redirectHome = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router.push("/home");
  };

  useEffect(() => {
    if (!user && pathname !== "/") {
      router.push("/");
    }
  }, [pathname, router, user]);

  useEffect(() => {
    if (!user) return;
    console.log("user: ", user);
    // saveUser(user);
  }, [user]);

  return (
    <header className="absolute right-5 top-5">
      {user ? (
        <div className="flex gap-4">
          <a
            href="#"
            onClick={redirectHome}
            className="text-xl sm:text-2xl border-2 border-brown p-2 transition-colors hover:bg-brown hover:text-lightBlue"
          >
            Home
          </a>
          <a
            href="#"
            onClick={handleSignOut}
            className="text-xl sm:text-2xl border-2 border-brown p-2 transition-colors hover:bg-brown hover:text-lightBlue"
          >
            Sign Out
          </a>
        </div>
      ) : (
        <a
          href="#"
          onClick={handleSignIn}
          className="text-xl sm:text-2xl p-2 font-semibold transition-colors hover:bg-white-50"
        >
          Sign Up / Log in
        </a>
      )}
    </header>
  );
};

export default Header;
