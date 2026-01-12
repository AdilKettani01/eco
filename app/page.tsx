import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import { Car, Home, Droplets, Sparkles, CheckCircle, Star, Users, Award } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: Car,
    title: 'Lavado de Vehículos',
    description: 'Limpieza exterior e interior de coches, motos y furgonetas con productos ecológicos.',
    price: '25€',
  },
  {
    icon: Home,
    title: 'Limpieza de Entradas',
    description: 'Limpieza a presión de entradas, garajes y zonas pavimentadas.',
    price: '5€/m²',
  },
  {
    icon: Droplets,
    title: 'Limpieza de Ventanas',
    description: 'Cristales impecables para hogares y negocios, interior y exterior.',
    price: '8€/ventana',
  },
  {
    icon: Sparkles,
    title: 'Pack Completo Hogar',
    description: 'Servicio integral: vehículo, entrada, ventanas y terrazas.',
    price: '220€',
  },
];

const features = [
  {
    icon: CheckCircle,
    title: 'Productos Ecológicos',
    description: 'Utilizamos únicamente productos biodegradables y respetuosos con el medio ambiente.',
  },
  {
    icon: Award,
    title: 'Profesionales Certificados',
    description: 'Nuestro equipo está formado y certificado en técnicas de limpieza sostenible.',
  },
  {
    icon: Users,
    title: 'Atención Personalizada',
    description: 'Adaptamos nuestros servicios a las necesidades específicas de cada cliente.',
  },
];

const testimonials = [
  {
    name: 'María García',
    location: 'Barcelona',
    text: 'Excelente servicio. Mi coche quedó impecable y los productos ecológicos me dan tranquilidad.',
    rating: 5,
  },
  {
    name: 'Carlos Rodríguez',
    location: 'Badalona',
    text: 'La limpieza de la entrada de mi casa quedó perfecta. Muy profesionales y puntuales.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    location: 'L\'Hospitalet',
    text: 'Contraté el pack completo y el resultado superó mis expectativas. ¡Muy recomendable!',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios de limpieza ecológica para satisfacer todas tus necesidades.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/servicios" className="btn-primary inline-block">
              Ver Todos los Servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por Qué Elegirnos?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En EcoLimpio combinamos profesionalidad con responsabilidad ambiental.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-[#059669]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#059669]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <p className="text-lg text-gray-100 max-w-2xl mx-auto">
              La satisfacción de nuestros clientes es nuestra mejor carta de presentación.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para una limpieza ecológica?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Solicita tu presupuesto gratuito hoy y descubre la diferencia de un servicio profesional y sostenible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservar"
              className="bg-[#059669] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#047857] transition-colors"
            >
              Reservar Ahora
            </Link>
            <Link
              href="/precios"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              Calcular Precio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
