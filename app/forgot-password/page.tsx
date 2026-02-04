import Link from 'next/link';
import { Mail, ShieldCheck, Sparkles } from 'lucide-react';
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
  return (
    <div className={`${urbanist.className} relative min-h-screen overflow-hidden bg-[#0b1a16] text-white`}>
      <div className="pointer-events-none absolute -top-44 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.35),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.45),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_40%,rgba(255,255,255,0.02))]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
            <Sparkles className="h-4 w-4" />
            Recuperación de cuenta
          </span>
          <h1 className={`${fraunces.className} text-4xl font-semibold leading-tight md:text-5xl`}>
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="max-w-xl text-base text-white/75 md:text-lg">
            No te preocupes, nuestro equipo te ayudará a recuperar el acceso a tu cuenta de forma segura.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-[#c2f970]" />
              <p className="text-sm font-semibold text-white">Proceso seguro</p>
              <p className="text-sm text-white/60">
                Verificamos tu identidad antes de restablecer tu contraseña.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <Mail className="mb-3 h-5 w-5 text-[#f6e6c2]" />
              <p className="text-sm font-semibold text-white">Atención personalizada</p>
              <p className="text-sm text-white/60">
                Nuestro equipo responderá tu solicitud lo antes posible.
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
                Para recuperar tu contraseña, envía un correo a:
              </p>
            </div>

            <div className="space-y-5">
              <a
                href="mailto:info@ecolimpio.es"
                className="flex items-center justify-center gap-3 rounded-xl bg-[#059669] px-4 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-[#047857]"
              >
                <Mail className="h-5 w-5" />
                info@ecolimpio.es
              </a>

              <p className="text-center text-sm text-slate-500">
                Incluye en tu correo el email con el que te registraste y te ayudaremos a restablecer tu contraseña.
              </p>
            </div>

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
