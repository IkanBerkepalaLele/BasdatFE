import { authSeed } from "../data/auth-seed";
import type { AuthSeed, Customer, Organizer, RoleName, UserAccount } from "../types";

export const cloneAuthSeed = (): AuthSeed => JSON.parse(JSON.stringify(authSeed)) as AuthSeed;

export function authenticate(users: UserAccount[], username: string, password: string) {
  return users.find(
    (user) =>
      user.username.toLowerCase() === username.trim().toLowerCase() &&
      user.password === password,
  );
}

export function getProfileName(data: AuthSeed, user: UserAccount | null) {
  if (!user) return "";
  if (user.role === "customer") {
    return data.customers.find((customer) => customer.userId === user.userId)?.fullName ?? user.username;
  }
  if (user.role === "organizer") {
    return data.organizers.find((organizer) => organizer.userId === user.userId)?.organizerName ?? user.username;
  }
  return "System Console";
}

export function getCustomer(data: AuthSeed, userId: string) {
  return data.customers.find((customer) => customer.userId === userId);
}

export function getOrganizer(data: AuthSeed, userId: string) {
  return data.organizers.find((organizer) => organizer.userId === userId);
}

export function createUser(data: AuthSeed, role: Exclude<RoleName, "admin">, form: RegisterPayload): AuthSeed {
  const nextUserId = `usr-${String(data.users.length + 1).padStart(3, "0")}`;
  const nextUser: UserAccount = {
    userId: nextUserId,
    username: form.username.trim(),
    password: form.password,
    role,
  };

  if (role === "customer") {
    const nextCustomer: Customer = {
      customerId: `cus-${String(data.customers.length + 1).padStart(3, "0")}`,
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      userId: nextUserId,
    };

    return {
      ...data,
      users: [...data.users, nextUser],
      customers: [...data.customers, nextCustomer],
    };
  }

  const nextOrganizer: Organizer = {
    organizerId: `org-${String(data.organizers.length + 1).padStart(3, "0")}`,
    organizerName: form.fullName.trim(),
    contactEmail: form.email.trim(),
    userId: nextUserId,
  };

  return {
    ...data,
    users: [...data.users, nextUser],
    organizers: [...data.organizers, nextOrganizer],
  };
}

export type RegisterPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  confirmation: string;
};
