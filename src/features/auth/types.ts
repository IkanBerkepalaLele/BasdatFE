export type RoleName = "admin" | "organizer" | "customer";

export type UserAccount = {
  userId: string;
  username: string;
  password: string;
  role: RoleName;
};

export type Role = {
  roleId: string;
  roleName: RoleName;
  label: string;
};

export type Customer = {
  customerId: string;
  fullName: string;
  phoneNumber: string;
  userId: string;
};

export type Organizer = {
  organizerId: string;
  organizerName: string;
  contactEmail: string;
  userId: string;
};

export type AuthSeed = {
  users: UserAccount[];
  roles: Role[];
  customers: Customer[];
  organizers: Organizer[];
};

export type SessionUser = UserAccount;

export type ToastState = {
  tone: "success" | "error" | "info";
  message: string;
} | null;
