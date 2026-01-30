'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { Fraunces, Urbanist } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const rules = useMemo(
    () => [
      { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
      { label: 'Una mayúscula', ok: /[A-Z]/.test(password) },
      { label: 'Una minúscula', ok: /[a-z]/.test(password) },
      { label: 'Un número', ok: /[0-9]/.test(password) },
    ],
    [password]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo restablecer la contraseña');
      }

      setStatus('success');
      setMessage(data.message || 'Contraseña actualizada correctamente.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
    }
  };

  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-hidden bg-[#0b1a16] text-white`}>
      <div className="pointer-events-none absolute -top-32 left-1/3 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.25),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.45),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.04),transparent_45%,rgba(255,255,255,0.03))]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
            <ShieldCheck className="h-4 w-4" />
            Nueva contraseña
          </span>
          <h1 className={`${fraunces.className} text-4xl font-semibold leading-tight md:text-5xl`}>
            Renueva tu seguridad con una clave fuerte
          </h1>
          <p className="max-w-xl text-base text-white/75 md:text-lg">
            Elige una contraseña única y segura. Cerraremos sesiones activas para proteger tu cuenta.
          </p>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-white">
              <KeyRound className="h-5 w-5 text-[#c2f970]" />
              Recomendaciones rápidas
            </div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {rules.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      rule.ok ? 'bg-[#c2f970]' : 'bg-white/30'
                    }`}
                  />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative">
          <div className="absolute -left-6 -top-6 hidden h-20 w-20 -rotate-6 rounded-2xl bg-[#c2f970] text-[#0b1a16] shadow-2xl lg:flex lg:items-center lg:justify-center">
            <Lock className="h-8 w-8" />
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/95 p-8 text-[#0b1a16] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
            <div className="mb-6">
              <h2 className={`${fraunces.className} text-2xl font-semibold`}>
                Crea tu nueva contraseña
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Usa una clave distinta a la anterior para mantener tu cuenta protegida.
              </p>
            </div>

            {!token ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                El enlace no es válido. Solicita uno nuevo para continuar.
                <div className="mt-2">
                  <Link href="/forgot-password" className="font-semibold text-amber-700 underline">
                    Solicitar nuevo enlace
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block text-sm font-semibold text-slate-700">
                  Nueva contraseña
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      disabled={status === 'loading'}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/15 disabled:cursor-not-allowed"
                    />
                  </div>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Confirmar contraseña
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      disabled={status === 'loading'}
                      placeholder="••••••••"
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
                      Guardando contraseña...
                    </span>
                  ) : (
                    <>
                      Guardar nueva contraseña
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
              <span>¿Todo listo?</span>
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
