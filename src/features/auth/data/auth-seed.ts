import type { AuthSeed, RoleName } from "../types";

export const roleLabels: Record<RoleName, string> = {
  admin: "Administrator",
  organizer: "Penyelenggara",
  customer: "Pelanggan",
  guest: "Tamu",
};

export const authSeed: AuthSeed = {
  roles: [
    { roleId: "rol-001", roleName: "admin", label: roleLabels.admin },
    { roleId: "rol-002", roleName: "organizer", label: roleLabels.organizer },
    { roleId: "rol-003", roleName: "customer", label: roleLabels.customer },
  ],
  users: [
    { userId: "usr-001", username: "admin1", password: "admin123", role: "admin" },
    { userId: "usr-002", username: "admin2", password: "admin123", role: "admin" },
    { userId: "usr-003", username: "admin3", password: "admin123", role: "admin" },
    { userId: "usr-004", username: "admin4", password: "admin123", role: "admin" },
    { userId: "usr-005", username: "admin5", password: "admin123", role: "admin" },
    { userId: "usr-006", username: "customer1", password: "customer123", role: "customer" },
    { userId: "usr-007", username: "customer2", password: "customer123", role: "customer" },
    { userId: "usr-008", username: "customer3", password: "customer123", role: "customer" },
    { userId: "usr-009", username: "customer4", password: "customer123", role: "customer" },
    { userId: "usr-010", username: "organizer1", password: "organizer123", role: "organizer" },
    { userId: "usr-011", username: "organizer2", password: "organizer123", role: "organizer" },
    { userId: "usr-012", username: "organizer3", password: "organizer123", role: "organizer" },
    { userId: "usr-013", username: "customer5", password: "customer123", role: "customer" },
    { userId: "usr-014", username: "organizer4", password: "organizer123", role: "organizer" },
    { userId: "usr-015", username: "organizer5", password: "organizer123", role: "organizer" },
  ],
  accountRoles: [
    { roleId: "rol-001", userId: "usr-001" },
    { roleId: "rol-001", userId: "usr-002" },
    { roleId: "rol-001", userId: "usr-003" },
    { roleId: "rol-001", userId: "usr-004" },
    { roleId: "rol-001", userId: "usr-005" },
    { roleId: "rol-003", userId: "usr-006" },
    { roleId: "rol-003", userId: "usr-007" },
    { roleId: "rol-003", userId: "usr-008" },
    { roleId: "rol-003", userId: "usr-009" },
    { roleId: "rol-002", userId: "usr-010" },
    { roleId: "rol-002", userId: "usr-011" },
    { roleId: "rol-002", userId: "usr-012" },
    { roleId: "rol-003", userId: "usr-013" },
    { roleId: "rol-002", userId: "usr-014" },
    { roleId: "rol-002", userId: "usr-015" },
  ],
  customers: [
    { customerId: "cus-001", fullName: "Budi Santoso", phoneNumber: "+62812345678", userId: "usr-006" },
    { customerId: "cus-002", fullName: "Sinta Permata", phoneNumber: "+62822345678", userId: "usr-007" },
    { customerId: "cus-003", fullName: "Raka Pratama", phoneNumber: "+62832345678", userId: "usr-008" },
    { customerId: "cus-004", fullName: "Dewi Laras", phoneNumber: "+62842345678", userId: "usr-009" },
    { customerId: "cus-005", fullName: "Nadia Kirana", phoneNumber: "+62852345678", userId: "usr-013" },
  ],
  organizers: [
    { organizerId: "org-001", organizerName: "Andi Wijaya", contactEmail: "organizer1@example.com", userId: "usr-010" },
    { organizerId: "org-002", organizerName: "Ruang Nada", contactEmail: "hello@ruangnada.id", userId: "usr-011" },
    { organizerId: "org-003", organizerName: "Svara Live", contactEmail: "ops@svaralive.id", userId: "usr-012" },
    { organizerId: "org-004", organizerName: "Kota Panggung", contactEmail: "team@kotapanggung.id", userId: "usr-014" },
    { organizerId: "org-005", organizerName: "Lentera Event", contactEmail: "event@lentera.id", userId: "usr-015" },
  ],
};

export const authDummySummary = {
  userAccount: authSeed.users.length,
  role: authSeed.roles.length,
  accountRole: authSeed.accountRoles.length,
  customer: authSeed.customers.length,
  organizer: authSeed.organizers.length,
  adminAccount: authSeed.users.filter((user) => user.role === "admin").length,
};
