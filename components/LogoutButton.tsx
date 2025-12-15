"use client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "ghost";
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "ghost",
  className = "",
  showIcon = true,
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await signOut();
      if (!result.error) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 ${className}`}
    >
      {isLoggingOut ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : showIcon ? (
        <LogOut className="h-4 w-4" />
      ) : null}
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
}
