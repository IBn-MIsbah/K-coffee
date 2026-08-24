import { Suspense } from "react";

import StaffInvitationAcceptance from "./staff-invitation-acceptance";

export const metadata = { title: "Accept staff invitation | K-Coffee" };

export default function StaffInvitationAcceptancePage() {
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-stone-600 dark:text-stone-300">Checking your invitation…</p>}>
      <StaffInvitationAcceptance />
    </Suspense>
  );
}
