import { HomeOverview } from "@/components/home-overview";
import { getMonthSummary, listRecentDonations } from "@/lib/donations/queries";
import { getDisplayName } from "@/lib/supabase/auth";

export default async function HomePage() {
  const [displayName, month, recent] = await Promise.all([getDisplayName(), getMonthSummary(), listRecentDonations()]);
  return <HomeOverview displayName={displayName} month={month} recent={recent} />;
}
