export const APPLICATION_STATUSES = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const KANBAN_COLUMNS: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
];
