import React from 'react';
import LeafCanvas from './LeafCanvas';
import Cloud from './Cloud';

/*
 * Lapisan suasana di belakang seluruh halaman:
 * langit cerah, awan bergeser, berkas cahaya matahari, dan partikel halus.
 * Dioptimalkan agar ringan dan hemat baterai di semua ukuran perangkat.
 */
export default function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere-glow" />
      <DriftClouds />
      <LightRays />
      <LeafCanvas leafCount={4} dustCount={12} palette="green" />
    </div>
  );
}

export function DriftClouds({ className = '' }) {
  return (
    <div className={`drift-clouds ${className}`}>
      <Cloud className="drift drift-1" />
      <Cloud className="drift drift-2" />
      <Cloud className="drift drift-3" />
      <Cloud className="drift drift-4" />
    </div>
  );
}

export function LightRays({ className = '' }) {
  return (
    <div className={`light-rays ${className}`}>
      <span className="ray ray-1" />
      <span className="ray ray-2" />
      <span className="ray ray-3" />
      <span className="ray ray-4" />
    </div>
  );
}
