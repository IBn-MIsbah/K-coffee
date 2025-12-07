"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const signInAction = async (
  prevState: { error?: string } | void,
  formData: FormData
) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  try {
    const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        callbackUrl: "/dashboard",
      }),
    });

    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      return {
        error: result.message || "Invalid email or password",
        details: result.error,
      };
    }

    const sessionToken = result.data?.session?.token;
    if (sessionToken) {
      const cookieStore = await cookies();
      cookieStore.set("session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    redirect("/dashboard");
  } catch (e) {
    console.error("Login error:", e);
    return { error: "Something went wrong. Please try again." };
  }
};

export async function signOutAction() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (sessionToken) {
      await fetch(`${baseURL}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${sessionToken}`,
        },
      });

      // Clear the session cookie
      cookieStore.delete("session");
    }

    redirect("/sign-in");
  } catch (error) {
    console.error("Sign out error:", error);
    redirect("/sign-in");
  }
}
