'use client';

import { useState } from 'react';
import { Car, Home, Droplets, Sparkles, Calendar, User, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface BookingData {
  // Step 1: Service selection
  services: string[];
  // Step 2: Date and time
  date: string;
  time: string;
  // Step 3: Contact info
  name: string;
  email: string;
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

  const updateData = (key: keyof BookingData, value: string | string[]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleService = (serviceId: string) => {
    const current = data.services;
    if (current.includes(serviceId)) {
      updateData('services', current.filter(s => s !== serviceId));
    } else {
      updateData('services', [...current, serviceId]);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.services.length > 0;
      case 2: return data.date && data.time;
      case 3: return data.name && data.email && data.phone && data.address;
      default: return false;
    }
  };

  const handleSubmit = () => {
    // In a real app, this would send to an API
    console.log('Booking submitted:', data);
    setIsSubmitted(true);
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Reserva Confirmada!</h2>
        <p className="text-gray-600 mb-6">
          Hemos recibido tu solicitud de reserva. Te contactaremos en las próximas 24 horas para confirmar los detalles.
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
        <p className="text-sm text-gray-500">
          Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp o email.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Steps */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3].map((s) => (
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
              {s < 3 && (
                <div
                  className={`w-16 sm:w-24 h-1 mx-2 ${
                    step > s ? 'bg-[#059669]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-gray-500">
          <span>Servicios</span>
          <span>Fecha y Hora</span>
          <span>Datos</span>
        </div>
      </div>

      <div className="p-6">
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
              {/* Date Selection */}
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

              {/* Time Selection */}
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

        {/* Step 3: Contact Information */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tus datos de contacto</h2>
            <p className="text-gray-600 mb-6">Necesitamos estos datos para confirmar tu reserva.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateData('name', e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                />
              </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => updateData('notes', e.target.value)}
                  placeholder="Cualquier información adicional que debamos saber..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={() => setStep(step - 1)}
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

          {step < 3 ? (
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
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-[#059669] text-white hover:bg-[#047857]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Confirmar Reserva</span>
              <CheckCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
