"use client";

import { Building2, LockKeyhole, Mail, Pencil, Phone, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { FormField } from "@/shared/components/form-field";
import { roleLabels } from "@/features/auth/data/auth-seed";
import { getCustomer, getOrganizer } from "@/features/auth/lib/auth-helpers";
import type { AuthSeed, ProfileUpdatePayload, SessionUser } from "@/features/auth/types";

type ProfilePageProps = {
  data: AuthSeed;
  onPasswordUpdate: (oldPassword: string, newPassword: string, confirmation: string) => void;
  onProfileUpdate: (payload: ProfileUpdatePayload) => void;
  user: SessionUser;
};

export function ProfilePage({ data, onPasswordUpdate, onProfileUpdate, user }: ProfilePageProps) {
  const customer = getCustomer(data, user.userId);
  const organizer = getOrganizer(data, user.userId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    fullName: customer?.fullName ?? "",
    phoneNumber: customer?.phoneNumber ?? "",
    organizerName: organizer?.organizerName ?? "",
    contactEmail: organizer?.contactEmail ?? "",
  });
  const [password, setPassword] = useState({ old: "", next: "", confirmation: "" });

  const displayName =
    user.role === "customer"
      ? customer?.fullName
      : user.role === "organizer"
        ? organizer?.organizerName
        : "System Console";

  function openEditor() {
    setDraft({
      fullName: customer?.fullName ?? "",
      phoneNumber: customer?.phoneNumber ?? "",
      organizerName: organizer?.organizerName ?? "",
      contactEmail: organizer?.contactEmail ?? "",
    });
    setEditing(true);
  }

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onProfileUpdate(draft);
    setEditing(false);
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPasswordUpdate(password.old, password.next, password.confirmation);
    setPassword({ old: "", next: "", confirmation: "" });
  }

  return (
    <section className="mx-auto max-w-5xl space-y-7">
      <div>
        <h1 className="text-4xl font-extrabold tracking-normal text-slate-950">Profil Saya</h1>
        <p className="mt-3 text-lg font-semibold text-slate-400">
          Kelola informasi pribadi dan preferensi akun Anda
        </p>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-7 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Informasi Profil</h2>
            <p className="mt-1 text-base font-semibold text-slate-400">
              Kelola data pribadi Anda di platform TikTakTuk
            </p>
          </div>
          {user.role !== "admin" && !editing && (
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-base font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={openEditor}
            >
              <Pencil size={18} /> Edit
            </button>
          )}
        </div>

        <div className="mt-12 flex h-24 w-24 items-center justify-center rounded-full bg-[#2878ff] text-4xl font-extrabold text-white">
          {(displayName ?? user.username).charAt(0).toUpperCase()}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <p className="text-sm font-extrabold text-slate-500">Role / Peran</p>
          <span className="mt-2 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-extrabold text-blue-700">
            {roleLabels[user.role]}
          </span>

          {!editing ? (
            <ProfileDetail customerName={customer?.fullName} organizerName={organizer?.organizerName} organizerEmail={organizer?.contactEmail} phoneNumber={customer?.phoneNumber} user={user} />
          ) : (
            <form className="mt-8 grid gap-5" onSubmit={submitProfile}>
              {user.role === "customer" && (
                <>
                  <FormField
                    label="Nama Lengkap"
                    name="profileFullName"
                    onChange={(value) => setDraft((current) => ({ ...current, fullName: value }))}
                    placeholder="Nama lengkap"
                    value={draft.fullName}
                  />
                  <FormField
                    label="Nomor Telepon"
                    name="profilePhone"
                    onChange={(value) => setDraft((current) => ({ ...current, phoneNumber: value }))}
                    placeholder="Nomor telepon"
                    value={draft.phoneNumber}
                  />
                </>
              )}
              {user.role === "organizer" && (
                <>
                  <FormField
                    label="Nama Organizer"
                    name="profileOrganizer"
                    onChange={(value) => setDraft((current) => ({ ...current, organizerName: value }))}
                    placeholder="Nama organizer"
                    value={draft.organizerName}
                  />
                  <FormField
                    label="Contact Email"
                    name="profileEmail"
                    onChange={(value) => setDraft((current) => ({ ...current, contactEmail: value }))}
                    placeholder="Email kontak"
                    type="email"
                    value={draft.contactEmail}
                  />
                </>
              )}
              <ReadonlyUsername username={user.username} />
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-lg border border-slate-200 px-5 py-3 font-extrabold text-slate-600"
                  onClick={() => setEditing(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="rounded-lg bg-[#171717] px-5 py-3 font-extrabold text-white">
                  Simpan Profil
                </button>
              </div>
            </form>
          )}
        </div>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-7 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3">
          <LockKeyhole size={25} />
          <h2 className="text-xl font-extrabold text-slate-900">Update Password</h2>
        </div>
        <p className="mt-3 text-base font-semibold text-slate-400">
          Perbarui password Anda untuk menjaga keamanan akun
        </p>
        <form className="mt-8 space-y-5" onSubmit={submitPassword}>
          <FormField
            label="Password Lama"
            name="oldPassword"
            onChange={(value) => setPassword((current) => ({ ...current, old: value }))}
            placeholder="Password Lama"
            type="password"
            value={password.old}
          />
          <FormField
            label="Password Baru"
            name="newPassword"
            onChange={(value) => setPassword((current) => ({ ...current, next: value }))}
            placeholder="Password Baru"
            type="password"
            value={password.next}
          />
          <FormField
            label="Konfirmasi Password Baru"
            name="confirmPassword"
            onChange={(value) => setPassword((current) => ({ ...current, confirmation: value }))}
            placeholder="Konfirmasi Password Baru"
            type="password"
            value={password.confirmation}
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-lg border border-slate-200 px-5 py-3 font-extrabold text-slate-600"
              onClick={() => setPassword({ old: "", next: "", confirmation: "" })}
              type="button"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-[#171717] px-5 py-3 font-extrabold text-white">
              Update Password
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

function ProfileDetail({
  customerName,
  organizerEmail,
  organizerName,
  phoneNumber,
  user,
}: {
  customerName?: string;
  organizerEmail?: string;
  organizerName?: string;
  phoneNumber?: string;
  user: SessionUser;
}) {
  return (
    <div className="mt-8 grid gap-7 sm:grid-cols-2">
      {user.role === "customer" && (
        <>
          <ProfileField icon={<UserRound size={18} />} label="Nama Lengkap" value={customerName ?? "-"} />
          <ProfileField icon={<Phone size={18} />} label="Nomor Telepon" value={phoneNumber ?? "-"} />
        </>
      )}
      {user.role === "organizer" && (
        <>
          <ProfileField icon={<Building2 size={18} />} label="Nama Organizer" value={organizerName ?? "-"} />
          <ProfileField icon={<Mail size={18} />} label="Contact Email" value={organizerEmail ?? "-"} />
        </>
      )}
      {user.role === "admin" && (
        <ProfileField icon={<ShieldCheck size={18} />} label="Akses" value="Hard-coded administrator" />
      )}
      <ProfileField icon={<UserRound size={18} />} label="Username" value={`@${user.username}`} />
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 text-base font-extrabold text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-lg font-extrabold text-slate-700">{value}</p>
    </div>
  );
}

function ReadonlyUsername({ username }: { username: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <p className="text-xs font-extrabold uppercase text-slate-400">Username</p>
      <p className="mt-1 text-sm font-extrabold text-slate-600">@{username}</p>
      <p className="mt-1 text-xs font-bold text-slate-400">Username tidak dapat diubah.</p>
    </div>
  );
}
