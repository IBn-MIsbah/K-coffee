import { requirePageSession } from "@/lib/authz";
import prisma from "@/lib/prisma";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import AccountSettings from "./account-settings";

export default async function ProfilePage() {
  const actor = await requirePageSession("/dashboard/profile");
  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });
  if (!user) return null;
  return (
    <section className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a56328]">
        Your account
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2c1911]">
        Profile
      </h1>
      <div className="mt-7 overflow-hidden rounded-3xl border border-[#ead9bf] bg-[#fffaf0] shadow-[0_18px_45px_rgba(88,49,22,.08)]">
        <div className="bg-[#3b2116] px-6 py-8 text-[#fff9ee] sm:px-8">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-full bg-[#f4bd4d] text-2xl font-extrabold text-[#3b2116]">
              {(user.name ?? user.email ?? "K").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {user.name ?? "K-Coffee guest"}
              </h2>
              <p className="mt-1 text-sm text-[#e9ca9e]">
                {user.role.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>
        <dl className="grid divide-y divide-[#ead9bf] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <ProfileField
            icon={Mail}
            label="Email"
            value={user.email ?? "Not provided"}
          />
          <ProfileField
            icon={Phone}
            label="Phone"
            value={user.phone ?? "Not provided"}
          />
          <ProfileField
            icon={ShieldCheck}
            label="Account role"
            value={user.role}
          />
          <div className="p-6">
            <dt className="text-sm text-[#725b4c]">Member since</dt>
            <dd className="mt-1 font-semibold text-[#3b2116]">
              {user.createdAt.toLocaleDateString("en-ET", {
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>
      <AccountSettings name={user.name ?? ""} phone={user.phone ?? ""} />
    </section>
  );
}
function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="p-6">
      <dt className="flex items-center gap-2 text-sm text-[#725b4c]">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </dt>
      <dd className="mt-1 break-words font-semibold text-[#3b2116]">{value}</dd>
    </div>
  );
}
