"use client";

import { ArrowLeft } from "lucide-react";
import { FormEvent, useState } from "react";
import { BrandMark } from "@/shared/components/brand-mark";
import { FormField } from "@/shared/components/form-field";

type LoginPageProps = {
  onBackToLanding: () => void;
  onLogin: (username: string, password: string) => void;
  onRegister: () => void;
};

export function LoginPage({ onBackToLanding, onLogin, onRegister }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin(username, password);
  }

  return (
    <main className="min-h-screen bg-[#eaf1ff] px-4 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[720px] flex-col justify-center">
        <BrandMark />
        <form
          className="mt-10 rounded-[22px] bg-white px-8 py-8 shadow-[0_18px_46px_rgba(15,23,42,0.12)] sm:px-10"
          onSubmit={submit}
        >
          <button
            className="mx-auto mb-7 flex items-center gap-2 text-base font-extrabold text-[#3481ff]"
            onClick={onBackToLanding}
            type="button"
          >
            <ArrowLeft size={18} /> Kembali ke Halaman Awal
          </button>
          <h2 className="text-2xl font-extrabold text-slate-950">Masuk ke Akun Anda</h2>
          <p className="mt-2 text-base font-semibold text-slate-400">
            Gunakan kredensial Anda untuk mengakses platform
          </p>
          <div className="mt-8 space-y-5">
            <FormField
              label="Username"
              name="username"
              onChange={setUsername}
              placeholder="Masukkan username"
              value={username}
            />
            <FormField
              label="Password"
              name="password"
              onChange={setPassword}
              placeholder="Masukkan password"
              type="password"
              value={password}
            />
          </div>
          <button className="mt-7 h-12 w-full rounded-lg bg-[#171717] text-base font-extrabold text-white transition hover:bg-black">
            Masuk
          </button>
        </form>
        <p className="mt-7 text-center text-base font-semibold text-slate-500">
          Belum punya akun?{" "}
          <button className="font-extrabold text-[#3481ff]" onClick={onRegister}>
            Daftar sekarang
          </button>
        </p>
      </section>
    </main>
  );
}
