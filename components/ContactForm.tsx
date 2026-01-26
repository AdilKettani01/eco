'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

const initialData: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
};

const serviceOptions = [
  { value: '', label: 'Selecciona un servicio (opcional)' },
  { value: 'vehiculos', label: 'Lavado de Vehículos' },
  { value: 'entradas', label: 'Limpieza de Entradas' },
  { value: 'ventanas', label: 'Limpieza de Ventanas' },
  { value: 'pack', label: 'Pack Completo' },
  { value: 'otro', label: 'Otro' },
];

export default function ContactForm() {
  const [data, setData] = useState<ContactFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const updateData = (key: keyof ContactFormData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!data.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!data.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!data.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (!data.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);
      alert('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-[#059669]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Mensaje Enviado!</h3>
        <p className="text-gray-600 mb-4">
          Gracias por contactar con nosotros. Te responderemos lo antes posible.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setData(initialData);
          }}
          className="text-[#059669] font-medium hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Envíanos un mensaje</h3>

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
            placeholder="Tu nombre"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email and Phone */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => updateData('email', e.target.value)}
              placeholder="tu@email.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => updateData('phone', e.target.value)}
              placeholder="+34 XXX XXX XXX"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Servicio de interés
          </label>
          <select
            value={data.service}
            onChange={(e) => updateData('service', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent bg-white"
          >
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje *
          </label>
          <textarea
            value={data.message}
            onChange={(e) => updateData('message', e.target.value)}
            placeholder="Cuéntanos en qué podemos ayudarte..."
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-colors ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#059669] text-white hover:bg-[#047857]'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Enviar Mensaje</span>
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        * Campos obligatorios. Responderemos en menos de 24 horas.
      </p>
    </form>
  );
}
