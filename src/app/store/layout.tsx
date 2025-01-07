"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const isAuthenticated = sessionStorage.getItem("isAuthenticated");
      setIsAuthed(!!isAuthenticated);
      
      if (!isAuthenticated && pathname !== "/") {
        router.replace("/");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/");
    }
  }, [pathname, router]);

  if (isAuthed === null) {
    return null; // or a loading spinner
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
} 