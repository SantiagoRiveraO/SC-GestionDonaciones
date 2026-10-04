import type { Database } from "./supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Donor = Database["public"]["Tables"]["donors"]["Row"];
export type Donation = Database["public"]["Tables"]["donations"]["Row"];
export type DonationListRow =
  Database["public"]["Views"]["donation_list"]["Row"];
export type AuditLogEntry = Database["public"]["Tables"]["audit_log"]["Row"];
export type DonationSummaryRow =
  Database["public"]["Functions"]["donation_summary"]["Returns"][number];
