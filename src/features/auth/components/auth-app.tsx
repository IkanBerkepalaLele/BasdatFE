"use client";

import { useEffect, useMemo, useState } from "react";
import { Toast } from "@/shared/components/toast";
import { authDummySummary, roleLabels } from "../data/auth-seed";
import {
  authenticate,
  cloneAuthSeed,
  createUser,
  getProfileName,
  type RegisterPayload,
} from "../lib/auth-helpers";
import type { AuthSeed, SessionUser, ToastState } from "../types";
import { AppNavbar } from "./app-navbar";
import { LoginPage } from "./login-page";
import { RegisterPage } from "./register-page";

type AuthScreen = "login" | "register";
type AppPage = "dashboard" | "profile";

const sessionStorageKey = "tiktaktuk-auth-user-id";

function readInitialSession() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(sessionStorageKey);
}

export function AuthApp() {
  const [data, setData] = useState<AuthSeed>(() => cloneAuthSeed());
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [activePage, setActivePage] = useState<AppPage>("dashboard");
  const [toast, setToast] = useState<ToastState>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => readInitialSession());

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const currentUser = useMemo(
    () => data.users.find((user) => user.userId === sessionUserId) ?? null,
    [data.users, sessionUserId],
  );

  function showToast(nextToast: NonNullable<ToastState>) {
    setToast(nextToast);
  }

  function login(username: string, password: string) {
    const user = authenticate(data.users, username, password);

    if (!user) {
      showToast({ tone: "error", message: "Username atau password salah." });
      return;
    }

    setSessionUserId(user.userId);
    setActivePage("dashboard");
    window.localStorage.setItem(sessionStorageKey, user.userId);
    showToast({ tone: "success", message: `Berhasil masuk sebagai ${roleLabels[user.role]}.` });
  }

  function logout() {
    setSessionUserId(null);
    setScreen("login");
    setActivePage("dashboard");
    window.localStorage.removeItem(sessionStorageKey);
    showToast({ tone: "success", message: "Session berakhir. Anda kembali ke halaman Login." });
  }

  function register(role: "customer" | "organizer", payload: RegisterPayload) {
    const requiredValues = Object.values(payload).map((value) => value.trim());

    if (requiredValues.some((value) => !value)) {
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
    setScreen("login");
    showToast({ tone: "success", message: "Akun baru berhasil dibuat. Silakan login." });
  }

  if (!currentUser) {
    return (
      <>
        <div className="fixed left-1/2 top-5 z-50 w-[min(92vw,560px)] -translate-x-1/2">
          <Toast toast={toast} />
        </div>
        {screen === "login" ? (
          <LoginPage onLogin={login} onRegister={() => setScreen("register")} />
        ) : (
          <RegisterPage onBackToLogin={() => setScreen("login")} onSubmit={register} />
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
      onDashboard={() => setActivePage("dashboard")}
      onLogout={logout}
      onProfile={() => setActivePage("profile")}
      toast={toast}
      user={currentUser}
    />
  );
}

function AuthenticatedApp({
  activePage,
  data,
  onBlockedFeature,
  onDashboard,
  onLogout,
  onProfile,
  toast,
  user,
}: {
  activePage: AppPage;
  data: AuthSeed;
  onBlockedFeature: (feature: string) => void;
  onDashboard: () => void;
  onLogout: () => void;
  onProfile: () => void;
  toast: ToastState;
  user: SessionUser;
}) {
  const profileName = getProfileName(data, user);

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <AppNavbar
        onDashboard={onDashboard}
        onFeatureBlocked={onBlockedFeature}
        onLogout={onLogout}
        onProfile={onProfile}
        role={user.role}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Toast toast={toast} />
        <section className="mt-5 rounded-xl bg-white p-8 shadow-sm">
          <p className="text-sm font-extrabold uppercase text-blue-600">{roleLabels[user.role]}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-slate-950">
            {activePage === "dashboard" ? "Dashboard" : "Profil Saya"}
          </h1>
          <p className="mt-2 text-slate-500">
            {activePage === "dashboard"
              ? `Selamat datang, ${profileName}. Total dummy USER_ACCOUNT saat ini ${authDummySummary.userAccount}.`
              : "Halaman profil akan diisi pada langkah berikutnya."}
          </p>
        </section>
      </main>
    </div>
  );
}
