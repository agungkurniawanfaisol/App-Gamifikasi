import type { Role } from "@prisma/client";

export const USERS_PAGE_SIZE = 20;

export const USER_SORT_FIELDS = [
  "name",
  "email",
  "role",
  "points",
  "createdAt",
  "isActive",
] as const;

export type UserSortField = (typeof USER_SORT_FIELDS)[number];
export type UserSortDir = "asc" | "desc";
export type UserStatusFilter = "active" | "inactive";

export type UserListItem = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  institution: string | null;
  studentId: string | null;
  isActive: boolean;
  points: number;
  createdAt: Date;
};

export type UsersListResult = {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
