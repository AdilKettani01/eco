import { Car, Home, Droplets, Sparkles, Leaf, CheckCircle, Bike, Truck } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    id: 'vehiculos',
    icon: Car,
    title: 'Lavado de Vehículos',
    description: 'Servicio completo de limpieza para todo tipo de vehículos utilizando productos 100% ecológicos y biodegradables.',
    longDescription: 'Nuestro servicio de lavado de vehículos incluye limpieza exterior e interior completa. Utilizamos técnicas de ahorro de agua y productos ecológicos que protegen tanto tu vehículo como el medio ambiente. Ideal para coches, motos, furgonetas y más.',
    features: [
      'Lavado exterior a mano',
      'Limpieza interior completa',
      'Aspirado de tapicería',
      'Limpieza de cristales',
      'Productos biodegradables',
      'Ahorro de agua',
    ],
    prices: [
      { name: 'Coche pequeño', price: '25€' },
      { name: 'Coche grande / SUV', price: '45€' },
      { name: 'Moto', price: '10€' },
      { name: 'Furgoneta', price: '40€' },
    ],
  },
  {
    id: 'entradas',
    icon: Home,
    title: 'Limpieza de Entradas',
    description: 'Limpieza profesional a presión de entradas, garajes, patios y zonas pavimentadas.',
    longDescription: 'Eliminamos manchas de aceite, suciedad acumulada, musgo y otros residuos de tus superficies exteriores. Utilizamos equipos de alta presión con agua caliente y detergentes ecológicos para resultados impecables.',
    features: [
      'Limpieza a alta presión',
      'Eliminación de manchas de aceite',
      'Tratamiento anti-musgo',
      'Limpieza de juntas',
      'Superficies de hormigón y adoquines',
      'Garajes y zonas de aparcamiento',
    ],
    prices: [
      { name: 'Precio por m²', price: '5€' },
      { name: 'Mínimo', price: '60€' },
      { name: 'Entrada estándar (hasta 20m²)', price: '90€' },
      { name: 'Garaje completo', price: '180€' },
    ],
  },
  {
    id: 'ventanas',
    icon: Droplets,
    title: 'Limpieza de Ventanas',
    description: 'Cristales impecables sin marcas ni rayas. Servicio para hogares y negocios.',
    longDescription: 'Ofrecemos limpieza profesional de ventanas para viviendas y locales comerciales. Nuestro equipo utiliza técnicas especializadas y productos ecológicos para dejar tus cristales completamente transparentes y brillantes.',
    features: [
      'Limpieza interior y exterior',
      'Sin marcas ni rayas',
      'Limpieza de marcos y persianas',
      'Alturas hasta 3 plantas',
      'Cristales de difícil acceso',
      'Productos sin químicos agresivos',
    ],
    prices: [
      { name: 'Por ventana estándar', price: '8€' },
      { name: 'Ventanal / Puerta corredera', price: '15€' },
      { name: 'Balconera', price: '12€' },
      { name: 'Limpieza de persianas', price: '+5€' },
    ],
  },
  {
    id: 'pack-hogar',
    icon: Sparkles,
    title: 'Pack Completo Hogar',
    description: 'Servicio integral que incluye vehículo, entrada, ventanas y terrazas.',
    longDescription: 'El servicio más completo para tu hogar. Combinamos todos nuestros servicios en un pack con precio especial. Ideal para una limpieza general de primavera o para preparar tu hogar para ocasiones especiales.',
    features: [
      'Lavado de 1 vehículo',
      'Limpieza de entrada (hasta 30m²)',
      'Limpieza de todas las ventanas',
      'Limpieza de terraza o balcón',
      'Descuento especial incluido',
      'Servicio en un solo día',
    ],
    prices: [
      { name: 'Pack Básico', price: '220€' },
      { name: 'Pack Familiar (2 vehículos)', price: '320€' },
      { name: 'Pack Premium', price: '450€' },
    ],
  },
];

export default function ServiciosPage() {
  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-[#059669] to-[#047857] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6 text-[#84cc16]" />
            <span className="text-[#84cc16] font-medium">Limpieza Ecológica</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Servicios</h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Soluciones de limpieza profesional y ecológica para tu hogar, vehículo y espacios exteriores en Barcelona.
          </p>
        </div>
      </section>

      {/* Services Detail Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="w-16 h-16 bg-[#059669]/10 rounded-xl flex items-center justify-center mb-6">
                    <service.icon className="h-8 w-8 text-[#059669]" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h2>
                  <p className="text-lg text-gray-600 mb-6">{service.longDescription}</p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-[#059669] flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/reservar"
                    className="btn-primary inline-block"
                  >
                    Reservar Este Servicio
                  </Link>
                </div>

                {/* Pricing Card */}
                <div className={`bg-white rounded-2xl shadow-xl p-8 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Precios</h3>
                  <div className="space-y-4">
                    {service.prices.map((price, i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700">{price.name}</span>
                        <span className="text-[#059669] font-bold text-lg">{price.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <strong>Nota:</strong> Precios no incluyen transporte. El coste de desplazamiento se calcula según tu ubicación.
                    </p>
                  </div>
                  <div className="mt-4 p-4 bg-[#059669]/5 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-[#059669]">¿Necesitas un presupuesto personalizado?</span> Contacta con nosotros para proyectos especiales o grandes superficies.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">También Ofrecemos</h2>
            <p className="text-lg text-gray-600">Servicios adicionales para completar tu limpieza</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Bike className="h-10 w-10 text-[#059669] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bicicletas</h3>
              <p className="text-gray-600 text-sm mb-2">Limpieza completa de bicicletas</p>
              <p className="text-[#059669] font-bold">Desde 8€</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Truck className="h-10 w-10 text-[#059669] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehículos Comerciales</h3>
              <p className="text-gray-600 text-sm mb-2">Camiones y flotas de empresa</p>
              <p className="text-[#059669] font-bold">Consultar</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Sparkles className="h-10 w-10 text-[#059669] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Limpieza de Mobiliario</h3>
              <p className="text-gray-600 text-sm mb-2">Muebles de jardín y exterior</p>
              <p className="text-[#059669] font-bold">Desde 25€</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#059669]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-lg text-gray-100 mb-8">
            Calcula tu presupuesto o reserva tu servicio ahora mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/precios"
              className="bg-white text-[#059669] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Calcular Precio
            </Link>
            <Link
              href="/reservar"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#059669] transition-colors"
            >
              Reservar Ahora
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
