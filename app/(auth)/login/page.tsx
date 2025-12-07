import { signInAction } from "@/actions/auth";
import LoginForm from "@/components/forms/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | K-Coffee",
};

const LoginPage = async () => {
  return <LoginForm action={signInAction} />;
};

export default LoginPage;
