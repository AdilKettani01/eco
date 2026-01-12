import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price?: string;
  href?: string;
}

export default function ServiceCard({ icon: Icon, title, description, price, href = '/servicios' }: ServiceCardProps) {
  return (
    <Link href={href} className="block">
      <div className="service-card bg-white rounded-xl p-6 shadow-md border border-gray-100 h-full">
        <div className="w-14 h-14 bg-[#059669]/10 rounded-lg flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-[#059669]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {price && (
          <div className="flex items-center justify-between">
            <span className="text-[#059669] font-bold text-lg">Desde {price}</span>
            <span className="text-[#059669] text-sm font-medium hover:underline">Ver más →</span>
          </div>
        )}
      </div>
    </Link>
  );
}
