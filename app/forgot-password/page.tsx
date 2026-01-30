'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Fraunces, Urbanist } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo enviar el enlace');
      }

      setStatus('sent');
      setMessage(data.message || 'Revisa tu correo para continuar.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
    }
  };

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-hidden bg-[#0b1a16] text-white`}>
      <div className="pointer-events-none absolute -top-44 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.35),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.45),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_40%,rgba(255,255,255,0.02))]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
            <Sparkles className="h-4 w-4" />
            Recuperación segura
          </span>
          <h1 className={`${fraunces.className} text-4xl font-semibold leading-tight md:text-5xl`}>
            Recupera tu acceso con calma
          </h1>
          <p className="max-w-xl text-base text-white/75 md:text-lg">
            Enviaremos un enlace privado para que puedas crear una nueva contraseña sin perder
            tus reservas ni tu historial.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-[#c2f970]" />
              <p className="text-sm font-semibold text-white">Enlaces con caducidad</p>
              <p className="text-sm text-white/60">
                Cada enlace expira automáticamente para proteger tu cuenta.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <Mail className="mb-3 h-5 w-5 text-[#f6e6c2]" />
              <p className="text-sm font-semibold text-white">Entrega inmediata</p>
              <p className="text-sm text-white/60">
                Revisa la bandeja principal y también la carpeta de spam.
              </p>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="absolute -right-6 -top-6 hidden h-20 w-20 rotate-6 rounded-2xl bg-[#c2f970] text-[#0b1a16] shadow-2xl lg:flex lg:items-center lg:justify-center">
            <Mail className="h-8 w-8" />
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/95 p-8 text-[#0b1a16] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
            <div className="mb-6">
              <h2 className={`${fraunces.className} text-2xl font-semibold`}>
                Restablecer contraseña
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Introduce tu correo y te enviaremos un enlace seguro.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Correo electrónico
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={status === 'loading'}
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/15 disabled:cursor-not-allowed"
                  />
                </div>
              </label>

              {message && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    status === 'error'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-[#047857] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Enviando enlace...
                  </span>
                ) : (
                  <>
                    Enviar enlace seguro
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
              <span>¿Recordaste tu contraseña?</span>
              <Link href="/login" className="font-semibold text-[#059669] hover:text-[#047857]">
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
