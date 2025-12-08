import LoginForm from "@/components/forms/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | K-Coffee",
};

const LoginPage = async () => {
  return <LoginForm />;
};

export default LoginPage;
