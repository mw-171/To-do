"use client";

import React, { useState, useEffect, MouseEvent } from "react";
import {
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
} from "../firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { ArrowRightIcon } from "@heroicons/react/16/solid";

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
    <header className="w-full h-16 shadow-lg shadow-gray-900">
      <div className="absolute right-5 top-5">
        {user ? (
          <div className="flex-row gap-4">
            <a
              href="#"
              onClick={redirectHome}
              className="group rounded-lg border border-transparent px-4 py-3 font-semibold transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            >
              Home
            </a>
            <a
              href="#"
              onClick={handleSignOut}
              className="group rounded-lg border border-transparent px-4 py-3 font-semibold transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            >
              Sign Out
            </a>
          </div>
        ) : (
          <a
            href="#"
            onClick={handleSignIn}
            className="group rounded-lg border border-transparent px-4 py-3 font-semibold transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            Sign up / Log in{" "}
            <span>
              <ArrowRightIcon className="w-5 h-5 font-semibold inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
            </span>
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;
