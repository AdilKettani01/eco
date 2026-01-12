import PriceCalculator from '@/components/PriceCalculator';
import { Leaf, CheckCircle } from 'lucide-react';

const priceList = [
  {
    category: 'Lavado de Vehículos',
    items: [
      { name: 'Coche pequeño', price: '25€' },
      { name: 'Coche grande / SUV', price: '45€' },
      { name: 'Moto', price: '10€' },
      { name: 'Furgoneta', price: '40€' },
      { name: 'Bicicleta', price: '8€' },
    ],
  },
  {
    category: 'Limpieza de Entradas',
    items: [
      { name: 'Precio por m²', price: '5€' },
      { name: 'Pedido mínimo', price: '60€' },
      { name: 'Entrada hasta 20m²', price: '90€' },
      { name: 'Garaje completo', price: '180€' },
    ],
  },
  {
    category: 'Limpieza de Ventanas',
    items: [
      { name: 'Ventana estándar', price: '8€' },
      { name: 'Ventanal / Puerta corredera', price: '15€' },
      { name: 'Balconera', price: '12€' },
      { name: 'Limpieza de persianas', price: '+5€' },
    ],
  },
];

const packs = [
  {
    name: 'Pack Básico',
    price: '220€',
    features: [
      'Lavado de 1 vehículo',
      'Limpieza entrada hasta 30m²',
      'Todas las ventanas de la vivienda',
    ],
    popular: false,
  },
  {
    name: 'Pack Familiar',
    price: '320€',
    features: [
      'Lavado de 2 vehículos',
      'Limpieza entrada hasta 40m²',
      'Todas las ventanas de la vivienda',
      'Limpieza de terraza o balcón',
    ],
    popular: true,
  },
  {
    name: 'Pack Premium',
    price: '450€',
    features: [
      'Lavado de 3 vehículos',
      'Limpieza entrada hasta 60m²',
      'Todas las ventanas de la vivienda',
      'Limpieza de terraza o balcón',
      'Mobiliario de exterior',
    ],
    popular: false,
  },
];

export default function PreciosPage() {
  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-[#059669] to-[#047857] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Leaf className="h-6 w-6 text-[#84cc16]" />
            <span className="text-[#84cc16] font-medium">Precios Transparentes</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Calcula tu Presupuesto</h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Usa nuestra calculadora interactiva para obtener un presupuesto instantáneo o consulta nuestra lista de precios.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Calculadora de Precios
          </h2>
          <PriceCalculator />
        </div>
      </section>

      {/* Price List Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Lista de Precios
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {priceList.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#059669] mb-4">{category.category}</h3>
                <ul className="space-y-3">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-gray-700">
                      <span>{item.name}</span>
                      <span className="font-semibold">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Transport Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-16">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Coste de desplazamiento no incluido</h3>
                <p className="text-amber-700 text-sm">
                  Los precios mostrados no incluyen el coste de desplazamiento. El importe del transporte se calculará en función de la distancia desde nuestra base en Barcelona hasta tu ubicación. Te informaremos del coste exacto antes de confirmar tu reserva.
                </p>
              </div>
            </div>
          </div>

          {/* Packs */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Packs Completos
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {packs.map((pack, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-6 ${
                  pack.popular
                    ? 'bg-[#059669] text-white shadow-xl scale-105'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#84cc16] text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Más Popular
                    </span>
                  </div>
                )}
                <h3 className={`text-xl font-semibold mb-2 ${pack.popular ? 'text-white' : 'text-gray-900'}`}>
                  {pack.name}
                </h3>
                <div className={`text-4xl font-bold mb-6 ${pack.popular ? 'text-white' : 'text-[#059669]'}`}>
                  {pack.price}
                </div>
                <ul className="space-y-3 mb-6">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 ${pack.popular ? 'text-[#84cc16]' : 'text-[#059669]'}`} />
                      <span className={pack.popular ? 'text-gray-100' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: '¿Los precios incluyen IVA?',
                a: 'Sí, todos los precios mostrados incluyen IVA.',
              },
              {
                q: '¿El transporte está incluido en los precios?',
                a: 'No, el coste de desplazamiento NO está incluido en los precios. Se calcula según la distancia desde Barcelona hasta tu ubicación. Te comunicaremos el importe exacto del transporte antes de confirmar la reserva.',
              },
              {
                q: '¿Cuánto cuesta el desplazamiento?',
                a: 'El coste varía según la zona: Barcelona ciudad (10-15€), área metropolitana (15-25€), zonas más alejadas (consultar). Para pedidos grandes o servicios regulares, podemos ofrecer descuentos en transporte.',
              },
              {
                q: '¿Cómo se calcula el precio de las entradas?',
                a: 'El precio se calcula por metro cuadrado (5€/m²), con un pedido mínimo de 60€.',
              },
              {
                q: '¿Ofrecéis descuentos para servicios regulares?',
                a: 'Sí, ofrecemos descuentos especiales para clientes que contratan servicios de forma regular (semanal o mensual), incluyendo posibles descuentos en el coste de transporte.',
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
