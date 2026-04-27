"use client";

import { ArrowLeft, Building2, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { BrandMark } from "@/shared/components/brand-mark";
import { FormField } from "@/shared/components/form-field";
import type { RegisterPayload } from "../lib/auth-helpers";
import type { RoleName } from "../types";

type RegisterRole = Exclude<RoleName, "admin">;

type RegisterPageProps = {
  onBackToLogin: () => void;
  onSubmit: (role: RegisterRole, payload: RegisterPayload) => void;
};

export function RegisterPage({ onBackToLogin, onSubmit }: RegisterPageProps) {
  const [role, setRole] = useState<RegisterRole | null>(null);

  return (
    <main className="min-h-screen bg-[#eaf1ff] px-4 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[720px] flex-col justify-center">
        <BrandMark />
        {!role ? (
          <RolePicker onBack={onBackToLogin} onSelect={setRole} />
        ) : (
          <RegisterForm
            onBack={() => setRole(null)}
            onLogin={onBackToLogin}
            onSubmit={(payload) => onSubmit(role, payload)}
            role={role}
          />
        )}
      </section>
    </main>
  );
}

function RolePicker({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (role: RegisterRole) => void;
}) {
  return (
    <>
      <div className="mt-10 rounded-[22px] bg-white px-8 py-8 shadow-[0_18px_46px_rgba(15,23,42,0.12)] sm:px-10">
        <button className="mx-auto mb-7 flex items-center gap-2 text-base font-extrabold text-[#3481ff]" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <h2 className="text-2xl font-extrabold text-slate-950">Jenis Pengguna</h2>
        <p className="mt-2 text-base font-semibold text-slate-400">
          Pilih jenis akun yang sesuai dengan kebutuhan Anda
        </p>
        <div className="mt-8 space-y-5">
          <RoleCard
            description="Beli dan kelola tiket untuk acara favorit Anda"
            icon={<UserRound className="text-[#2878ff]" size={32} />}
            label="Pelanggan"
            onClick={() => onSelect("customer")}
          />
          <RoleCard
            description="Buat dan kelola acara serta venue Anda"
            icon={<Building2 className="text-[#f05b2d]" size={32} />}
            label="Penyelenggara"
            onClick={() => onSelect("organizer")}
          />
        </div>
      </div>
      <LoginLink onClick={onBack} />
    </>
  );
}

function RoleCard({
  description,
  icon,
  label,
  onClick,
}: {
  description: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-5 rounded-xl border border-slate-200 bg-white px-6 py-5 text-left shadow-sm transition hover:border-[#3481ff] hover:shadow-md"
      onClick={onClick}
    >
      {icon}
      <span>
        <span className="block text-2xl font-extrabold text-slate-950">{label}</span>
        <span className="mt-1 block text-base font-semibold text-slate-500">{description}</span>
      </span>
    </button>
  );
}

function RegisterForm({
  onBack,
  onLogin,
  onSubmit,
  role,
}: {
  onBack: () => void;
  onLogin: () => void;
  onSubmit: (payload: RegisterPayload) => void;
  role: RegisterRole;
}) {
  const [form, setForm] = useState<RegisterPayload>({
    fullName: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
    confirmation: "",
  });
  const title = role === "customer" ? "Daftar sebagai Pelanggan" : "Daftar sebagai Penyelenggara";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <>
      <form
        className="mt-10 rounded-[22px] bg-white px-8 py-8 shadow-[0_18px_46px_rgba(15,23,42,0.12)] sm:px-10"
        onSubmit={submit}
      >
        <button className="mx-auto mb-7 flex items-center gap-2 text-base font-extrabold text-[#3481ff]" onClick={onBack} type="button">
          <ArrowLeft size={18} /> Kembali
        </button>
        <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>
        <p className="mt-2 text-base font-semibold text-slate-400">
          Buat akun baru untuk memulai pengalaman Anda
        </p>
        <div className="mt-8 space-y-5">
          <FormField
            label="Nama Lengkap"
            name="fullName"
            onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
            placeholder="Masukkan nama lengkap"
            value={form.fullName}
          />
          <FormField
            label="Email"
            name="email"
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            placeholder="Masukkan email"
            type="email"
            value={form.email}
          />
          <FormField
            label="Nomor Telepon"
            name="phoneNumber"
            onChange={(value) => setForm((current) => ({ ...current, phoneNumber: value }))}
            placeholder="Masukkan nomor telepon"
            value={form.phoneNumber}
          />
          <FormField
            label="Username"
            name="registerUsername"
            onChange={(value) => setForm((current) => ({ ...current, username: value }))}
            placeholder="Pilih username"
            value={form.username}
          />
          <FormField
            label="Password"
            name="registerPassword"
            onChange={(value) => setForm((current) => ({ ...current, password: value }))}
            placeholder="Minimal 6 karakter"
            type="password"
            value={form.password}
          />
          <FormField
            label="Konfirmasi Password"
            name="confirmation"
            onChange={(value) => setForm((current) => ({ ...current, confirmation: value }))}
            placeholder="Konfirmasi password"
            type="password"
            value={form.confirmation}
          />
        </div>
        <button className="mt-7 h-12 w-full rounded-lg bg-[#171717] text-base font-extrabold text-white transition hover:bg-black">
          Daftar
        </button>
      </form>
      <LoginLink onClick={onLogin} />
    </>
  );
}

function LoginLink({ onClick }: { onClick: () => void }) {
  return (
    <p className="mt-7 text-center text-base font-semibold text-slate-500">
      Sudah punya akun?{" "}
      <button className="font-extrabold text-[#3481ff]" onClick={onClick}>
        Login di sini
      </button>
    </p>
  );
}
