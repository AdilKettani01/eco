import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className=" flex items-center mb-10">
            <Link href="/" className="flex items-center">
              <Image src="/Logo.svg" alt="EcoLimpio" width={40} height={20} priority />
              <h1 className=" ml-3 font-regular font-inter text-3xl text-[#81ceb3]"> <span className='font-bold font-inter text-[#278F64]'>Eco</span>Limpio</h1>
            </Link>
          </div>
            <p className="text-gray-400 mb-4">
              Limpieza ecológica profesional para tu hogar, vehículo y espacios exteriores en Barcelona.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#84cc16] transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#84cc16] transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="text-gray-400 hover:text-white transition-colors">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/precios" className="text-gray-400 hover:text-white transition-colors">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/reservar" className="text-gray-400 hover:text-white transition-colors">
                  Reservar
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Lavado de Vehículos</li>
              <li className="text-gray-400">Limpieza de Entradas</li>
              <li className="text-gray-400">Limpieza de Ventanas</li>
              <li className="text-gray-400">Limpieza Exterior</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4 text-[#84cc16]" />
                <span>+34 603492863</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4 text-[#84cc16]" />
                <span>info@ecolimpio.es</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4 text-[#84cc16]" />
                <span>Barcelona, Cataluña</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Clock className="h-4 w-4 text-[#84cc16]" />
                <span>Lun - Sáb: 8:00 - 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EcoLimpio. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
