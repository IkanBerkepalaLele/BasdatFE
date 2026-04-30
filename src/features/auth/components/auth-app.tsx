"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Toast } from "@/shared/components/toast";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { VenueListPage } from "@/features/venue/components/venue-list-page";
import { EventListPage } from "@/features/event/components/event-list-page";
import { ArtistListPage } from "@/features/artist/components/artist-list-page";
import { TicketCategoryListPage } from "@/features/ticket-category/components/ticket-category-list-page";
import { TicketListPage } from "@/features/ticket/components/ticket-list-page";
import { SeatListPage } from "@/features/seat/components/seat-list-page";
import { GuestLandingPage, GuestShell } from "@/features/guest/components/guest-landing-page";
import { roleLabels } from "../data/auth-seed";
import {
  authenticate,
  cloneAuthSeed,
  createUser,
  type RegisterPayload,
} from "../lib/auth-helpers";
import type { AuthSeed, ProfileUpdatePayload, RoleName, SessionUser, ToastState } from "../types";
import { AppNavbar } from "./app-navbar";
import { LoginPage } from "./login-page";
import { RegisterPage } from "./register-page";

type AuthScreen = "guest" | "guest-ticket-category" | "login" | "register";
type AppPage = "dashboard" | "profile" | "venue" | "event" | "ticket" | "seat" | "artist" | "ticket-category";
const sessionStorageKey = "tiktaktuk-auth-user-id";

const pagePathMap: Record<AppPage, string> = {
  artist: "/artist",
  dashboard: "/dashboard",
  event: "/event",
  profile: "/profile",
  seat: "/seat",
  ticket: "/ticket",
  "ticket-category": "/ticket-category",
  venue: "/venue",
};

const pathPageMap: Record<string, AppPage> = {
  "/artist": "artist",
  "/dashboard": "dashboard",
  "/event": "event",
  "/profile": "profile",
  "/seat": "seat",
  "/ticket": "ticket",
  "/ticket-category": "ticket-category",
  "/venue": "venue",
};

function normalizePath(pathname: string) {
  const path = pathname.replace(/\/+$/, "");
  return path || "/";
}

function getPageFromPath(pathname: string) {
  return pathPageMap[normalizePath(pathname)] ?? null;
}

function getGuestScreenFromPath(pathname: string): AuthScreen {
  const path = normalizePath(pathname);

  if (path === "/login") return "login";
  if (path === "/register") return "register";
  if (path === "/ticket-category") return "guest-ticket-category";
  if (pathPageMap[path]) return "login";

  return "guest";
}

function readSessionSnapshot() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(sessionStorageKey);
}

function writeSession(userId: string | null) {
  if (typeof window === "undefined") return;

  if (userId) {
    window.localStorage.setItem(sessionStorageKey, userId);
  } else {
    window.localStorage.removeItem(sessionStorageKey);
  }
}

export function AuthApp() {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<AuthSeed>(() => cloneAuthSeed());
  const [toast, setToast] = useState<ToastState>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    function syncSession() {
      setSessionUserId(readSessionSnapshot());
    }

    const timer = window.setTimeout(syncSession, 0);
    window.addEventListener("storage", syncSession);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const currentUser = useMemo(
    () => data.users.find((user) => user.userId === sessionUserId) ?? null,
    [data.users, sessionUserId],
  );
  const activePage = currentUser ? getPageFromPath(pathname) ?? "dashboard" : "dashboard";
  const currentScreen = currentUser ? "guest" : getGuestScreenFromPath(pathname);

  useEffect(() => {
    if (!currentUser) return;

    if (!getPageFromPath(pathname) && normalizePath(pathname) !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [currentUser, pathname, router]);

  function showToast(nextToast: NonNullable<ToastState>) {
    setToast(nextToast);
  }

  function navigateGuest(nextScreen: AuthScreen) {
    const nextPath =
      nextScreen === "login"
        ? "/login"
        : nextScreen === "register"
          ? "/register"
          : nextScreen === "guest-ticket-category"
            ? "/ticket-category"
            : "/";

    router.push(nextPath);
  }

  function navigateApp(page: AppPage) {
    router.push(pagePathMap[page]);
  }

  function showGuestPromotionMessage() {
    showToast({ tone: "info", message: "Promosi belum diimplementasi." });
  }

  function showGuestLanding() {
    navigateGuest("guest");
  }

  function showGuestTicketCategory() {
    navigateGuest("guest-ticket-category");
  }

  function login(username: string, password: string) {
    const user = authenticate(data.users, username, password);

    if (!user) {
      showToast({ tone: "error", message: "Username atau password salah." });
      return;
    }

    setSessionUserId(user.userId);
    const requestedPage = getPageFromPath(pathname) ?? "dashboard";
    writeSession(user.userId);
    router.replace(pagePathMap[requestedPage]);
    showToast({ tone: "success", message: `Berhasil masuk sebagai ${roleLabels[user.role]}.` });
  }

  function logout() {
    setSessionUserId(null);
    writeSession(null);
    router.replace("/");
    showToast({ tone: "success", message: "Session berakhir. Anda kembali ke halaman awal." });
  }

  function register(role: RoleName, payload: RegisterPayload) {
    const requiredValues =
      role === "admin"
        ? [payload.username, payload.password, payload.confirmation]
        : Object.values(payload);

    if (requiredValues.some((value) => !value.trim())) {
      showToast({ tone: "error", message: "Seluruh field wajib diisi." });
      return;
    }

    if (data.users.some((user) => user.username.toLowerCase() === payload.username.trim().toLowerCase())) {
      showToast({ tone: "error", message: "Username sudah digunakan." });
      return;
    }

    if (payload.password.length < 6) {
      showToast({ tone: "error", message: "Password minimal 6 karakter." });
      return;
    }

    if (payload.password !== payload.confirmation) {
      showToast({ tone: "error", message: "Konfirmasi password tidak cocok." });
      return;
    }

    setData((current) => createUser(current, role, payload));
    navigateGuest("login");
    showToast({ tone: "success", message: "Akun baru berhasil dibuat. Silakan login." });
  }

  function updateProfile(payload: ProfileUpdatePayload) {
    if (!currentUser) return;

    if (currentUser.role === "customer") {
      if (!payload.fullName?.trim() || !payload.phoneNumber?.trim()) {
        showToast({ tone: "error", message: "Nama lengkap dan nomor telepon wajib diisi." });
        return;
      }

      setData((current) => ({
        ...current,
        customers: current.customers.map((customer) =>
          customer.userId === currentUser.userId
            ? {
                ...customer,
                fullName: payload.fullName!.trim(),
                phoneNumber: payload.phoneNumber!.trim(),
              }
            : customer,
        ),
      }));
      showToast({ tone: "success", message: "Profil berhasil diperbarui." });
      return;
    }

    if (currentUser.role === "organizer") {
      if (!payload.organizerName?.trim() || !payload.contactEmail?.trim()) {
        showToast({ tone: "error", message: "Nama organizer dan email kontak wajib diisi." });
        return;
      }

      setData((current) => ({
        ...current,
        organizers: current.organizers.map((organizer) =>
          organizer.userId === currentUser.userId
            ? {
                ...organizer,
                organizerName: payload.organizerName!.trim(),
                contactEmail: payload.contactEmail!.trim(),
              }
            : organizer,
        ),
      }));
      showToast({ tone: "success", message: "Profil berhasil diperbarui." });
    }
  }

  function updatePassword(oldPassword: string, newPassword: string, confirmation: string) {
    if (!currentUser) return;

    if (!oldPassword || !newPassword || !confirmation) {
      showToast({ tone: "error", message: "Seluruh field password wajib diisi." });
      return;
    }

    if (oldPassword !== currentUser.password) {
      showToast({ tone: "error", message: "Password lama tidak sesuai." });
      return;
    }

    if (newPassword.length < 6) {
      showToast({ tone: "error", message: "Password baru minimal 6 karakter." });
      return;
    }

    if (newPassword !== confirmation) {
      showToast({ tone: "error", message: "Konfirmasi password baru tidak cocok." });
      return;
    }

    setData((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.userId === currentUser.userId ? { ...user, password: newPassword } : user,
      ),
    }));
    showToast({ tone: "success", message: "Password berhasil diubah." });
  }

  if (!currentUser) {
    return (
      <>
        <div className="fixed left-1/2 top-5 z-50 w-[min(92vw,560px)] -translate-x-1/2">
          <Toast toast={toast} />
        </div>
        {currentScreen === "guest" ? (
          <GuestLandingPage
            onLanding={showGuestLanding}
            onLogin={() => navigateGuest("login")}
            onPromotion={showGuestPromotionMessage}
            onRegister={() => navigateGuest("register")}
            onTicketCategory={showGuestTicketCategory}
          />
        ) : currentScreen === "guest-ticket-category" ? (
          <GuestShell
            onLanding={showGuestLanding}
            onLogin={() => navigateGuest("login")}
            onPromotion={showGuestPromotionMessage}
            onRegister={() => navigateGuest("register")}
            onTicketCategory={showGuestTicketCategory}
          >
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <TicketCategoryListPage role="guest" />
            </div>
          </GuestShell>
        ) : currentScreen === "login" ? (
          <LoginPage
            onBackToLanding={showGuestLanding}
            onLogin={login}
            onRegister={() => navigateGuest("register")}
          />
        ) : (
          <RegisterPage onBackToLogin={() => navigateGuest("login")} onSubmit={register} />
        )}
      </>
    );
  }

  return (
    <AuthenticatedApp
      activePage={activePage}
      data={data}
      onBlockedFeature={(feature) =>
        showToast({ tone: "info", message: `${feature} akan diimplementasi rekan tim.` })
      }
      onDashboard={() => navigateApp("dashboard")}
      onLogout={logout}
      onProfile={() => navigateApp("profile")}
      onVenue={() => navigateApp("venue")}
      onArtist={() => navigateApp("artist")}
      onEvent={() => navigateApp("event")}
      onTicketCategory={() => navigateApp("ticket-category")}
      onTicket={() => navigateApp("ticket")}
      onSeat={() => navigateApp("seat")}
      onProfileUpdate={updateProfile}
      onPasswordUpdate={updatePassword}
      toast={toast}
      user={currentUser}
    />
  );
}

function AuthenticatedApp({
  activePage,
  data,
  onArtist,
  onBlockedFeature,
  onTicketCategory,
  onDashboard,
  onEvent,
  onLogout,
  onPasswordUpdate,
  onProfile,
  onVenue,
  onProfileUpdate,
  onTicket,
  onSeat,
  toast,
  user,
}: {
  activePage: AppPage;
  data: AuthSeed;
  onArtist: () => void;
  onBlockedFeature: (feature: string) => void;
  onTicketCategory: () => void;
  onDashboard: () => void;
  onEvent: () => void;
  onLogout: () => void;
  onPasswordUpdate: (oldPassword: string, newPassword: string, confirmation: string) => void;
  onProfile: () => void;
  onVenue: () => void;
  onTicket: () => void;
  onSeat: () => void;
  onProfileUpdate: (payload: ProfileUpdatePayload) => void;
  toast: ToastState;
  user: SessionUser;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <AppNavbar
        activePage={activePage}
        onArtist={onArtist}
        onDashboard={onDashboard}
        onEvent={onEvent}
        onFeatureBlocked={onBlockedFeature}
        onLogout={onLogout}
        onProfile={onProfile}
        onTicketCategory={onTicketCategory}
        onVenue={onVenue}
        onTicket={onTicket}
        onSeat={onSeat}
        role={user.role}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Toast toast={toast} />
        {activePage === "dashboard" ? (
          <div className="mt-5">
            <DashboardPage
              data={data}
              onEvent={onEvent}
              onPromotion={() => onBlockedFeature("Promosi")}
              onTicket={onTicket}
              onVenue={onVenue}
              user={user}
            />
          </div>
        ) : activePage === "venue" ? (
          <div className="mt-5">
            <VenueListPage role={user.role} />
          </div>
        ) : activePage === "event" ? (
          <div className="mt-5">
            <EventListPage
              role={user.role}
              organizerId={
                user.role === "organizer"
                  ? data.organizers.find((o) => o.userId === user.userId)?.organizerId
                  : undefined
              }
            />
          </div>
        ) : activePage === "artist" ? (
          <div className="mt-5">
            <ArtistListPage role={user.role} />
          </div>
        ) : activePage === "ticket-category" ? (
          <div className="mt-5">
            <TicketCategoryListPage role={user.role} />
          </div>
        ) : activePage === "ticket" ? (
          <div className="mt-5">
            <TicketListPage
              role={user.role}
              customerId={
                user.role === "customer"
                  ? data.customers.find((c) => c.userId === user.userId)?.customerId
                  : undefined
              }
            />
          </div>
        )  : activePage === "seat" ? (
          <div className="mt-5"><SeatListPage role={user.role} /></div>
        ) : (
          <div className="mt-5">
            <ProfilePage
              data={data}
              onPasswordUpdate={onPasswordUpdate}
              onProfileUpdate={onProfileUpdate}
              user={user}
            />
          </div>
        )}
      </main>
    </div>
  );
}
