export const ALLOWED_BORROW_STATUS = ["issued", "returned", "late"] as const;

export type BorrowStatus = (typeof ALLOWED_BORROW_STATUS)[number];
