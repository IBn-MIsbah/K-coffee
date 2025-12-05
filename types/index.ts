/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@/app/generated/prisma/client";
import { UserRole } from "@/lib/rbac";

// For OrderStatus
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// For ReservationStatus
export enum ReservationStatus {
  CONFIRMED = "CONFIRMED",
  SEATED = "SEATED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  phone: string | null;
  image: string | null;
  preferences: Prisma.JsonValue | null; // Prisma.JsonValue is a generic type for JSON fields
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: string;
  userId: string | null;
  orderNumber: string;
  totalAmount: Prisma.Decimal;
  status: OrderStatus;
  storeId: string;
  pickupTime: Date | null;
  createdAt: Date;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type StoreLocation = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: Prisma.JsonValue;
  coordinates: string | null;
  isActive: boolean;
};

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    orders: true;
    reservations: true;
    sessions: true;
    accounts: true;
    auditLogs: true;
  };
}>;

/* This type would look roughly like this:
export type UserWithRelations = User & {
  orders: Order[];
  reservations: Reservation[];
  sessions: Session[];
  accounts: Account[];
  auditLogs: AuditLog[];
}; 
*/

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number; // Int maps to number
  price: Prisma.Decimal;
};

export type Reservation = {
  id: string;
  userId: string;
  storeId: string;
  partySize: number; // Int maps to number
  reservationTime: Date;
  status: ReservationStatus;
  notes: string | null;
  createdAt: Date;
};

export type Session = {
  [x: string]: any;
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
};

export type Account = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Verification = {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Permission = {
  id: string;
  action: string;
  resource: string;
  description: string | null;
  allowedRoles: UserRole[]; // Based on the enum array definition
  createdAt: Date;
  updatedAt: Date;
};

export type AuditLog = {
  id: string;
  userId: string | null;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Prisma.JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};
