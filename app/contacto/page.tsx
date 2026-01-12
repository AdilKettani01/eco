import ContactForm from '@/components/ContactForm';
import { Leaf, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function ContactoPage() {
  const phoneNumber = '34XXXXXXXXX'; // Replace with actual phone number
  const message = '¡Hola! Me gustaría solicitar información sobre los servicios de limpieza de EcoLimpio.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-[#059669] to-[#047857] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6 text-[#84cc16]" />
            <span className="text-[#84cc16] font-medium">Estamos Aquí para Ayudarte</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contacto</h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta? Estamos encantados de ayudarte. Contáctanos por el medio que prefieras.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* WhatsApp CTA */}
              <div className="bg-[#25D366] rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="h-8 w-8" />
                  <h3 className="text-xl font-semibold">¿Prefieres WhatsApp?</h3>
                </div>
                <p className="mb-4 text-white/90">
                  Escríbenos directamente por WhatsApp para una respuesta más rápida. Estamos disponibles de lunes a sábado.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-white text-[#25D366] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Abrir WhatsApp</span>
                </a>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Información de Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-[#059669]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Teléfono</h4>
                      <p className="text-gray-600">+34 XXX XXX XXX</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-[#059669]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600">info@ecolimpio.es</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-[#059669]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Zona de Servicio</h4>
                      <p className="text-gray-600">Barcelona y alrededores</p>
                      <p className="text-sm text-gray-500">Barcelona, Badalona, L&apos;Hospitalet, Sant Cugat, y más</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[#059669]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Horario de Atención</h4>
                      <p className="text-gray-600">Lunes - Viernes: 8:00 - 20:00</p>
                      <p className="text-gray-600">Sábados: 9:00 - 18:00</p>
                      <p className="text-sm text-gray-500">Domingos: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Zonas de Servicio</h3>
                <p className="text-gray-600 mb-4">
                  Operamos en Barcelona y su área metropolitana. Si tu zona no está en la lista, consúltanos.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Barcelona', 'Badalona', 'L\'Hospitalet', 'Sant Cugat',
                    'Terrassa', 'Sabadell', 'Esplugues', 'Cornellà',
                    'El Prat', 'Castelldefels', 'Sitges', 'Gavà'
                  ].map((zone) => (
                    <span
                      key={zone}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Placeholder */}
      <section className="bg-gray-200 h-64 md:h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg">Mapa de Barcelona</p>
          <p className="text-sm">Integra Google Maps aquí</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: '¿Cuánto tardáis en responder?',
                a: 'Respondemos a todos los mensajes en un plazo máximo de 24 horas. Para consultas urgentes, te recomendamos contactar por WhatsApp o teléfono.',
              },
              {
                q: '¿Ofrecéis presupuesto sin compromiso?',
                a: 'Sí, todos nuestros presupuestos son gratuitos y sin compromiso. Puedes usar nuestra calculadora de precios o contactarnos para un presupuesto personalizado.',
              },
              {
                q: '¿Trabajáis los fines de semana?',
                a: 'Sí, trabajamos de lunes a sábado. Los sábados atendemos de 9:00 a 18:00. Los domingos no ofrecemos servicio.',
              },
              {
                q: '¿Cuál es la zona de cobertura?',
                a: 'Cubrimos Barcelona ciudad y toda el área metropolitana. Para zonas más alejadas, consúltanos y te confirmaremos si podemos atenderte.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
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
