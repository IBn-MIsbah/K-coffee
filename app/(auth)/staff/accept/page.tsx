import { Suspense } from "react";

import StaffInvitationAcceptance from "./staff-invitation-acceptance";

export const metadata = { title: "Accept staff invitation | K-Coffee" };

export default function StaffInvitationAcceptancePage() {
  return <Suspense fallback={<section className="rounded-2xl bg-white p-8 text-center shadow-xl"><p className="text-sm text-gray-600">Checking your invitation…</p></section>}><StaffInvitationAcceptance /></Suspense>;
}
