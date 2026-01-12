import BookingForm from '@/components/BookingForm';
import { Leaf, Phone, Clock, CheckCircle } from 'lucide-react';

export default function ReservarPage() {
  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-[#059669] to-[#047857] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6 text-[#84cc16]" />
            <span className="text-[#84cc16] font-medium">Reserva Fácil</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Reservar Servicio</h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Completa el formulario en 3 sencillos pasos y te contactaremos para confirmar tu reserva.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingForm />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-[#059669]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmación Rápida</h3>
              <p className="text-gray-600">
                Recibirás confirmación de tu reserva en menos de 24 horas.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-[#059669]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin Compromiso</h3>
              <p className="text-gray-600">
                Te llamamos para confirmar detalles y ajustar el presupuesto si es necesario.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#059669]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancelación Flexible</h3>
              <p className="text-gray-600">
                Puedes cancelar o modificar tu reserva hasta 24h antes sin coste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Preguntas sobre la Reserva
          </h2>

          <div className="space-y-4">
            {[
              {
                q: '¿Cómo funciona el proceso de reserva?',
                a: 'Completa el formulario con los servicios que necesitas, elige fecha y hora preferida, y déjanos tus datos. Te contactaremos en menos de 24 horas para confirmar todos los detalles.',
              },
              {
                q: '¿Puedo reservar para el mismo día?',
                a: 'Las reservas deben hacerse con al menos 24 horas de antelación. Para servicios urgentes, contáctanos directamente por WhatsApp o teléfono.',
              },
              {
                q: '¿Qué pasa si necesito cambiar la fecha?',
                a: 'Puedes modificar o cancelar tu reserva sin coste hasta 24 horas antes del servicio programado. Simplemente contáctanos y te ayudaremos.',
              },
              {
                q: '¿Cómo se realiza el pago?',
                a: 'El pago se realiza una vez completado el servicio. Aceptamos efectivo, tarjeta y transferencia bancaria.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
