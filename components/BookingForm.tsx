'use client';

import { useState, useEffect, useRef } from 'react';
import { Car, Home, Droplets, Sparkles, Calendar, CheckCircle, ArrowLeft, ArrowRight, Mail, Lock, Phone, MapPin, MessageSquare, Shield } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface BookingData {
  // Step 1: Service selection
  services: string[];
  // Step 2: Date and time
  date: string;
  time: string;
  // Step 3: Account & Contact info
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  notes: string;
}

const initialData: BookingData = {
  services: [],
  date: '',
  time: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: '',
  notes: '',
};

const serviceOptions = [
  { id: 'vehiculos', icon: Car, name: 'Lavado de Vehículos', description: 'Coches, motos, furgonetas' },
  { id: 'entradas', icon: Home, name: 'Limpieza de Entradas', description: 'Garajes, patios, zonas exteriores' },
  { id: 'ventanas', icon: Droplets, name: 'Limpieza de Ventanas', description: 'Cristales interiores y exteriores' },
  { id: 'pack', icon: Sparkles, name: 'Pack Completo', description: 'Servicio integral para tu hogar' },
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>(initialData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // SMS Verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Google reCAPTCHA v3 state
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  // Load Google reCAPTCHA v3 script
  useEffect(() => {
    if (!captchaLoaded) {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

      // SECURITY: Fail if reCAPTCHA is not configured - never use test keys
      if (!siteKey) {
        console.error('CRITICAL: NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured');
        setError('Error de configuración. Contacta al administrador.');
        return;
      }

      // Check if script already exists
      if (document.querySelector('script[src*="recaptcha"]')) {
        if (window.grecaptcha) {
          setCaptchaLoaded(true);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setCaptchaLoaded(true);
      };

      document.body.appendChild(script);
    }
  }, [captchaLoaded]);

  const updateData = (key: keyof BookingData, value: string | string[]) => {
    setData(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const toggleService = (serviceId: string) => {
    const current = data.services;
    if (current.includes(serviceId)) {
      updateData('services', current.filter(s => s !== serviceId));
    } else {
      updateData('services', [...current, serviceId]);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    // Spanish phone format: +34 or 6/7/9 followed by 8 digits
    const cleaned = phone.replace(/\s/g, '');
    return /^(\+34)?[679]\d{8}$/.test(cleaned);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.services.length > 0;
      case 2:
        return data.date && data.time;
      case 3:
        return (
          data.name &&
          data.email &&
          validateEmail(data.email) &&
          data.password &&
          data.password.length >= 6 &&
          data.password === data.confirmPassword &&
          data.phone &&
          validatePhone(data.phone) &&
          data.address
        );
      case 4:
        return codeVerified;
      default:
        return false;
    }
  };

  const sendVerificationCode = async () => {
    setSendingCode(true);
    setError('');

    try {
      // Get reCAPTCHA v3 token
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (!siteKey) {
        throw new Error('Error de configuración. Contacta al administrador.');
      }

      if (!captchaLoaded || !window.grecaptcha) {
        throw new Error('Verificación de seguridad no cargada. Recarga la página.');
      }

      const captchaToken = await window.grecaptcha.execute(siteKey, { action: 'send_code' });

      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, captchaToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar el código');
      }

      setCodeSent(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al enviar el código');
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setVerifyingCode(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.phone,
          code: verificationCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Código incorrecto');
      }

      setCodeVerified(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al verificar el código');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!codeVerified) {
      setError('Debes verificar tu número de teléfono');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create user account and booking together
      const response = await fetch('/api/bookings/with-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // User data
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          // Booking data
          services: data.services,
          date: data.date,
          time: data.time,
          address: data.address,
          notes: data.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la reserva');
      }

      setIsSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al enviar la reserva');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-[#059669]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Cuenta Creada y Reserva Confirmada!</h2>
        <p className="text-gray-600 mb-6">
          Tu cuenta ha sido creada exitosamente. Te contactaremos en las próximas 24 horas para confirmar los detalles de tu reserva.
        </p>
        <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen de tu reserva:</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Servicios:</span> {data.services.map(s => serviceOptions.find(opt => opt.id === s)?.name).join(', ')}</p>
            <p><span className="text-gray-500">Fecha:</span> {new Date(data.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><span className="text-gray-500">Hora:</span> {data.time}</p>
            <p><span className="text-gray-500">Nombre:</span> {data.name}</p>
            <p><span className="text-gray-500">Dirección:</span> {data.address}</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Accede a tu cuenta:</strong> Puedes iniciar sesión con tu email y contraseña para ver tus reservas.
          </p>
        </div>
        <a
          href="/login"
          className="inline-block bg-[#059669] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#047857] transition-colors"
        >
          Iniciar Sesión
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Steps */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-[#059669] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 sm:w-16 h-1 mx-1 sm:mx-2 ${
                    step > s ? 'bg-[#059669]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-lg mx-auto mt-2 text-xs text-gray-500">
          <span>Servicios</span>
          <span>Fecha</span>
          <span>Cuenta</span>
          <span>Verificar</span>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecciona los servicios</h2>
            <p className="text-gray-600 mb-6">Elige uno o varios servicios que necesites.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {serviceOptions.map((service) => {
                const isSelected = data.services.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#059669] bg-[#059669]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#059669] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <service.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isSelected ? 'text-[#059669]' : 'text-gray-900'}`}>
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Date and Time */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Elige fecha y hora</h2>
            <p className="text-gray-600 mb-6">Selecciona cuándo te gustaría recibir el servicio.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Fecha preferida
                </label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => updateData('date', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora preferida
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => updateData('time', time)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        data.time === time
                          ? 'bg-[#059669] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Account & Contact Information */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Crea tu cuenta</h2>
            <p className="text-gray-600 mb-6">Completa tus datos para crear tu cuenta y realizar la reserva.</p>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateData('name', e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData('email', e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                />
                {data.email && !validateEmail(data.email) && (
                  <p className="text-red-500 text-xs mt-1">Email inválido</p>
                )}
              </div>

              {/* Password */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Lock className="h-4 w-4 inline mr-1" />
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={data.password}
                    onChange={(e) => updateData('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                  />
                  {data.password && data.password.length < 6 && (
                    <p className="text-red-500 text-xs mt-1">Mínimo 6 caracteres</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Lock className="h-4 w-4 inline mr-1" />
                    Confirmar contraseña *
                  </label>
                  <input
                    type="password"
                    value={data.confirmPassword}
                    onChange={(e) => updateData('confirmPassword', e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                  />
                  {data.confirmPassword && data.password !== data.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Teléfono móvil *
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateData('phone', e.target.value)}
                  placeholder="+34 612 345 678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                />
                {data.phone && !validatePhone(data.phone) && (
                  <p className="text-red-500 text-xs mt-1">Formato: +34 6XX XXX XXX</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Te enviaremos un código de verificación</p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Dirección del servicio *
                </label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => updateData('address', e.target.value)}
                  placeholder="Calle, número, código postal, ciudad"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => updateData('notes', e.target.value)}
                  placeholder="Cualquier información adicional..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
                />
              </div>

              {/* Google reCAPTCHA v3 Badge Info */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>
                    Este sitio está protegido por reCAPTCHA y se aplican la{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#059669] hover:underline">
                      Política de Privacidad
                    </a>{' '}
                    y los{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#059669] hover:underline">
                      Términos de Servicio
                    </a>{' '}
                    de Google.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Phone Verification */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifica tu teléfono</h2>
            <p className="text-gray-600 mb-6">
              Enviaremos un código SMS al número <strong>{data.phone}</strong>
            </p>

            <div className="max-w-md mx-auto space-y-6">
              {!codeSent ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-[#059669]" />
                  </div>
                  <p className="text-gray-600 mb-6">
                    Haz clic en el botón para recibir tu código de verificación
                  </p>
                  <button
                    onClick={sendVerificationCode}
                    disabled={sendingCode}
                    className="bg-[#059669] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#047857] transition-colors disabled:bg-gray-300"
                  >
                    {sendingCode ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Enviando...</span>
                      </span>
                    ) : (
                      'Enviar código SMS'
                    )}
                  </button>
                </div>
              ) : !codeVerified ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Phone className="h-10 w-10 text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-6">
                    Introduce el código de 6 dígitos que hemos enviado a tu teléfono
                  </p>
                  <div className="mb-6">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-48 text-center text-2xl tracking-widest px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={verifyCode}
                    disabled={verifyingCode || verificationCode.length !== 6}
                    className="bg-[#059669] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#047857] transition-colors disabled:bg-gray-300"
                  >
                    {verifyingCode ? 'Verificando...' : 'Verificar código'}
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    ¿No recibiste el código?{' '}
                    <button
                      onClick={sendVerificationCode}
                      disabled={sendingCode}
                      className="text-[#059669] hover:underline"
                    >
                      Reenviar
                    </button>
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Teléfono verificado!</h3>
                  <p className="text-gray-600">
                    Tu número ha sido verificado correctamente. Haz clic en "Confirmar Reserva" para completar.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={() => {
              setStep(step - 1);
              setError('');
            }}
            disabled={step === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Anterior</span>
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-[#059669] text-white hover:bg-[#047857]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Siguiente</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!codeVerified || isLoading}
              className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-colors ${
                codeVerified && !isLoading
                  ? 'bg-[#059669] text-white hover:bg-[#047857]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Procesando...</span>
                </span>
              ) : (
                <>
                  <span>Confirmar Reserva</span>
                  <CheckCircle className="h-5 w-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
