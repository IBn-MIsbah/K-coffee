import { requirePageSession } from "@/lib/authz";
import { getDefaultStoreId } from "@/lib/account/profile-validation";
import prisma from "@/lib/prisma";
import { UserRole } from "@/lib/rbac";
import { BadgeCheck, Mail, Phone, ShieldCheck, Sparkles } from "lucide-react";
import AccountSettings from "./account-settings";
import SessionManager from "./session-manager";

export default async function ProfilePage() {
  const actor = await requirePageSession("/dashboard/profile");
  const [user, stores] = await Promise.all([prisma.user.findUnique({
    where: { id: actor.id },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      createdAt: true,
      preferences: true,
    },
  }), actor.role === UserRole.USER ? prisma.storeLocation.findMany({ where: { isActive: true }, select: { id: true, name: true, address: true }, orderBy: { name: "asc" } }) : Promise.resolve([])]);
  if (!user) return null;
  return (
    <section className="relative mx-auto max-w-5xl pb-6">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 left-1/4 size-64 rounded-full bg-[#f4bd4d]/25 blur-3xl" />
      <div className="relative"><p className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-[#8a4e22] shadow-sm backdrop-blur-xl"><Sparkles aria-hidden="true" className="size-3.5" />Your account</p><h1 className="mt-4 text-4xl font-extrabold tracking-[-.04em] text-[#2c1911] sm:text-5xl">Profile & security</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[#684b39]">Your personal details, sign-in controls, and active devices—kept together in one private space.</p></div>
      <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 shadow-[0_24px_65px_rgba(88,49,22,.15)] backdrop-blur-2xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#3b2116] via-[#573321] to-[#8a4e22] px-6 py-8 text-[#fff9ee] sm:px-8 sm:py-10"><div aria-hidden="true" className="absolute -right-16 -top-20 size-56 rounded-full border border-white/15 bg-white/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-5"><div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-2xl bg-[#f4bd4d] text-2xl font-extrabold text-[#3b2116] shadow-lg">
              {(user.name ?? user.email ?? "K").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold">
                {user.name ?? "K-Coffee guest"}
              </h2>
              <p className="mt-1 text-sm text-[#f1d7ae]">
                {user.role.replaceAll("_", " ")}
              </p>
            </div></div><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-bold text-[#fff0d5]"><BadgeCheck aria-hidden="true" className="size-4 text-[#f4bd4d]" />Account protected</span></div>
        </div>
        <dl className="grid divide-y divide-[#ead9bf]/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
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
          <div className="p-6 sm:p-7">
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
      <AccountSettings name={user.name ?? ""} phone={user.phone ?? ""} email={user.email ?? ""} stores={stores} defaultStoreId={getDefaultStoreId(user.preferences)} />
      <div className="mt-6"><SessionManager /></div>
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
    <div className="p-6 sm:p-7 transition-colors hover:bg-white/35">
      <dt className="flex items-center gap-2 text-sm text-[#725b4c]">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </dt>
      <dd className="mt-1 wrap-break-word text-base font-bold text-[#3b2116]">
        {value}
      </dd>
    </div>
  );
}
