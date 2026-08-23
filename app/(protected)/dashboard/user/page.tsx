import { redirect } from "next/navigation";

export default function UserDashboard() {
  redirect("/dashboard/profile");
}
