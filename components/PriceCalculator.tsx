'use client';

import { useState } from 'react';
import { Car, Home, Droplets, Sparkles, Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ServiceSelection {
  // Vehicles
  smallCars: number;
  largeCars: number;
  motos: number;
  vans: number;
  // Driveways
  drivewaySqm: number;
  // Windows
  standardWindows: number;
  largeWindows: number;
  balconeras: number;
  includePersianas: boolean;
  // Pack
  includePack: 'none' | 'basic' | 'family' | 'premium';
}

const initialSelection: ServiceSelection = {
  smallCars: 0,
  largeCars: 0,
  motos: 0,
  vans: 0,
  drivewaySqm: 0,
  standardWindows: 0,
  largeWindows: 0,
  balconeras: 0,
  includePersianas: false,
  includePack: 'none',
};

// Prices
const prices = {
  smallCar: 25,
  largeCar: 45,
  moto: 10,
  van: 40,
  drivewaySqm: 5,
  drivewayMin: 60,
  standardWindow: 8,
  largeWindow: 15,
  balconera: 12,
  persiana: 5,
  packBasic: 220,
  packFamily: 320,
  packPremium: 450,
};

export default function PriceCalculator() {
  const [selection, setSelection] = useState<ServiceSelection>(initialSelection);
  const [activeTab, setActiveTab] = useState<'individual' | 'pack'>('individual');

  const updateSelection = (key: keyof ServiceSelection, value: number | boolean | string) => {
    setSelection(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotal = () => {
    if (activeTab === 'pack' && selection.includePack !== 'none') {
      switch (selection.includePack) {
        case 'basic': return prices.packBasic;
        case 'family': return prices.packFamily;
        case 'premium': return prices.packPremium;
        default: return 0;
      }
    }

    let total = 0;

    // Vehicles
    total += selection.smallCars * prices.smallCar;
    total += selection.largeCars * prices.largeCar;
    total += selection.motos * prices.moto;
    total += selection.vans * prices.van;

    // Driveways
    if (selection.drivewaySqm > 0) {
      const drivewayTotal = selection.drivewaySqm * prices.drivewaySqm;
      total += Math.max(drivewayTotal, prices.drivewayMin);
    }

    // Windows
    const windowCount = selection.standardWindows + selection.largeWindows + selection.balconeras;
    total += selection.standardWindows * prices.standardWindow;
    total += selection.largeWindows * prices.largeWindow;
    total += selection.balconeras * prices.balconera;
    if (selection.includePersianas && windowCount > 0) {
      total += windowCount * prices.persiana;
    }

    return total;
  };

  const total = calculateTotal();

  const NumberInput = ({
    label,
    value,
    onChange,
    unit = '',
    min = 0,
    max = 100,
    step = 1
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
          disabled={value <= min}
        >
          -
        </button>
        <span className="w-16 text-center font-semibold text-gray-900">
          {value}{unit}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 rounded-full bg-[#059669] hover:bg-[#047857] flex items-center justify-center text-white font-bold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('individual')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
            activeTab === 'individual'
              ? 'bg-[#059669] text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Servicios Individuales
        </button>
        <button
          onClick={() => setActiveTab('pack')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
            activeTab === 'pack'
              ? 'bg-[#059669] text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Packs Completos
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'individual' ? (
          <div className="space-y-8">
            {/* Vehicles Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-5 w-5 text-[#059669]" />
                <h3 className="font-semibold text-gray-900">Lavado de Vehículos</h3>
              </div>
              <div className="space-y-1">
                <NumberInput
                  label={`Coches pequeños (${prices.smallCar}€)`}
                  value={selection.smallCars}
                  onChange={(v) => updateSelection('smallCars', v)}
                />
                <NumberInput
                  label={`Coches grandes / SUV (${prices.largeCar}€)`}
                  value={selection.largeCars}
                  onChange={(v) => updateSelection('largeCars', v)}
                />
                <NumberInput
                  label={`Motos (${prices.moto}€)`}
                  value={selection.motos}
                  onChange={(v) => updateSelection('motos', v)}
                />
                <NumberInput
                  label={`Furgonetas (${prices.van}€)`}
                  value={selection.vans}
                  onChange={(v) => updateSelection('vans', v)}
                />
              </div>
            </div>

            {/* Driveways Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-5 w-5 text-[#059669]" />
                <h3 className="font-semibold text-gray-900">Limpieza de Entradas</h3>
              </div>
              <NumberInput
                label={`Metros cuadrados (${prices.drivewaySqm}€/m²)`}
                value={selection.drivewaySqm}
                onChange={(v) => updateSelection('drivewaySqm', v)}
                unit=" m²"
                max={500}
                step={5}
              />
              {selection.drivewaySqm > 0 && selection.drivewaySqm * prices.drivewaySqm < prices.drivewayMin && (
                <p className="text-sm text-amber-600 mt-2">
                  * Pedido mínimo: {prices.drivewayMin}€
                </p>
              )}
            </div>

            {/* Windows Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Droplets className="h-5 w-5 text-[#059669]" />
                <h3 className="font-semibold text-gray-900">Limpieza de Ventanas</h3>
              </div>
              <div className="space-y-1">
                <NumberInput
                  label={`Ventanas estándar (${prices.standardWindow}€)`}
                  value={selection.standardWindows}
                  onChange={(v) => updateSelection('standardWindows', v)}
                />
                <NumberInput
                  label={`Ventanales / Puertas correderas (${prices.largeWindow}€)`}
                  value={selection.largeWindows}
                  onChange={(v) => updateSelection('largeWindows', v)}
                />
                <NumberInput
                  label={`Balconeras (${prices.balconera}€)`}
                  value={selection.balconeras}
                  onChange={(v) => updateSelection('balconeras', v)}
                />
              </div>
              {(selection.standardWindows + selection.largeWindows + selection.balconeras) > 0 && (
                <label className="flex items-center space-x-3 mt-4 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selection.includePersianas}
                    onChange={(e) => updateSelection('includePersianas', e.target.checked)}
                    className="w-5 h-5 text-[#059669] rounded"
                  />
                  <span className="text-gray-700">
                    Incluir limpieza de persianas (+{prices.persiana}€ por ventana)
                  </span>
                </label>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#059669]" />
              <h3 className="font-semibold text-gray-900">Elige tu Pack</h3>
            </div>

            {[
              { id: 'basic', name: 'Pack Básico', price: prices.packBasic, features: ['1 vehículo', 'Entrada hasta 30m²', 'Todas las ventanas'] },
              { id: 'family', name: 'Pack Familiar', price: prices.packFamily, features: ['2 vehículos', 'Entrada hasta 40m²', 'Todas las ventanas', 'Terraza'] },
              { id: 'premium', name: 'Pack Premium', price: prices.packPremium, features: ['3 vehículos', 'Entrada hasta 60m²', 'Todas las ventanas', 'Terraza', 'Mobiliario exterior'] },
            ].map((pack) => (
              <label
                key={pack.id}
                className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selection.includePack === pack.id
                    ? 'border-[#059669] bg-[#059669]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="pack"
                      checked={selection.includePack === pack.id}
                      onChange={() => updateSelection('includePack', pack.id)}
                      className="w-5 h-5 text-[#059669]"
                    />
                    <span className="font-semibold text-gray-900">{pack.name}</span>
                  </div>
                  <span className="text-[#059669] font-bold text-xl">{pack.price}€</span>
                </div>
                <ul className="ml-8 text-sm text-gray-600 space-y-1">
                  {pack.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </label>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="mt-8 p-6 bg-gray-900 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-6 w-6 text-[#84cc16]" />
              <span className="text-lg">Presupuesto Estimado</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-[#84cc16]">{total}€</span>
              <p className="text-xs text-gray-400">+ transporte</p>
            </div>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-200">
              <strong>Transporte no incluido:</strong> El coste de desplazamiento se calculará según tu ubicación (desde 10€).
            </p>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            * El precio final puede variar según las condiciones específicas del servicio.
          </p>
          <Link
            href={`/reservar?total=${total}`}
            className="flex items-center justify-center space-x-2 w-full bg-[#059669] hover:bg-[#047857] text-white py-3 rounded-lg font-semibold transition-colors"
          >
            <span>Reservar Ahora</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
