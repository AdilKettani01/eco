import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shield, Clock, Leaf } from 'lucide-react';
import Ecology from '@/app/eco-ecology-energy-2-svgrepo-com.svg'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#059669] to-[#047857] text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#84cc16] rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-6 w-6 text-[#84cc16]" />
              <span className="text-[#84cc16] font-medium">Limpieza 100% Ecológica</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Tu hogar y vehículo <span className="text-[#84cc16]">brillantes</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-lg">
              Servicios profesionales de limpieza ecológica en Barcelona. Cuidamos tu espacio y el medio ambiente con productos naturales.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/reservar"
                className="bg-white text-[#059669] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors text-center shadow-lg"
              >
                Reservar Servicio
              </Link>
              <Link
                href="/precios"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#059669] transition-colors text-center"
              >
                Ver Precios
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-[#84cc16]" />
                <span className="text-sm">Resultados impecables</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[#84cc16]" />
                <span className="text-sm">100% garantizado</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[#84cc16]" />
                <span className="text-sm">Servicio puntual</span>
              </div>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              {/* Decorative elements */}
              <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center">
                    <Image src={Ecology} alt="Ecology" width={150} height={150} />
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white text-[#059669] px-4 py-2 rounded-full font-bold shadow-lg">
                Eco-Friendly
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[#84cc16] text-white px-4 py-2 rounded-full font-bold shadow-lg">
                Barcelona
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
