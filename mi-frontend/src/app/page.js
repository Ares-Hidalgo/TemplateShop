// src/app/page.js
'use client'

import { useState } from 'react';
import Link from 'next/link';
import { FaBox, FaShoppingCart, FaUsers, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-secondary-light">
      <header className="bg-primary shadow-md p-4 items-center">
        <h1 className="text-center text-2xl font-bold text-white ">Y&A Nexus</h1>
        <button onClick={toggleMenu} className="text-white md:hidden">
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </header>
      <main className="flex flex-col items-center justify-center py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/productos" className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:bg-secondary transition-transform transform hover:scale-105">
            <FaBox size={50} className="text-primary mb-2" />
            <span className="text-lg font-semibold text-primary-dark">Gestión de Productos</span>
          </Link>
          <Link href="/ventas" className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:bg-secondary transition-transform transform hover:scale-105">
            <FaShoppingCart size={50} className="text-primary mb-2" />
            <span className="text-lg font-semibold text-primary-dark">Gestión de Ventas</span>
          </Link>
          <Link href="/clientes" className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:bg-secondary transition-transform transform hover:scale-105">
            <FaUsers size={50} className="text-primary mb-2" />
            <span className="text-lg font-semibold text-primary-dark">Gestión de Clientes</span>
          </Link>
          <Link href="/reportes" className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg hover:bg-secondary transition-transform transform hover:scale-105">
            <FaChartBar size={50} className="text-primary mb-2" />
            <span className="text-lg font-semibold text-primary-dark">Reportes</span>
          </Link>
        </div>
      </main>
    </div>
  );
}