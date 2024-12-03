'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reportes() {
    const [ventas, setVentas] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [previewTitle, setPreviewTitle] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchVentas();
        fetchInventario();
    }, []);

    const fetchVentas = async () => {
        try {
            const response = await fetch('http://localhost:3001/ventas');
            if (!response.ok) throw new Error('Error al obtener las ventas');
            const data = await response.json();
            setVentas(data);
        } catch (error) {
            console.error('Error al obtener las ventas:', error);
        }
    };

    const fetchInventario = async () => {
        try {
            const response = await fetch('http://localhost:3001/inventario');
            if (!response.ok) throw new Error('Error al obtener el inventario');
            const data = await response.json();
            setInventario(data);
        } catch (error) {
            console.error('Error al obtener el inventario:', error);
        }
    };

    const generateInventoryReport = () => {
        return inventario;
    };

    const showReportPreview = (reportData, title) => {
        setPreviewData(reportData || []);
        setPreviewTitle(title);
        setShowPreview(true);
    };

    const exportToPDF = (reportData, title) => {
        const doc = new jsPDF();
        doc.text(title, 20, 20);
        doc.autoTable({
            head: [['Producto', 'Cantidad Comprada']],
            body: reportData.map(item => [item.nombre, item.cantidad_comprada]),
        });
        doc.save(`${title}.pdf`);
    };

    const exportToExcel = (reportData, title) => {
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, `${title}.xlsx`);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-center">Reportes</h1>
            <Link href="/" className="inline-block mb-4 p-2 bg-primary text-white rounded hover:bg-primary-dark items-center">
                <FaArrowLeft className="mr-2" />
            </Link>
            <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                <h2 className="text-xl font-bold mb-2">Reporte de Inventario</h2>
                <button onClick={() => exportToPDF(inventario, 'Reporte de Inventario')} className="mt-4 p-2 mb-2 mr-2 bg-blue-500 text-white rounded">Exportar a PDF</button>
                <button onClick={() => exportToExcel(inventario, 'Reporte de Inventario')} className="mt-4 p-2 mb-2 bg-green-500 text-white rounded">Exportar a Excel</button>
                <table className="w-full bg-white shadow-md rounded mb-4">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Producto</th>
                            <th className="py-3 px-6 text-left">Cantidad Comprada</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {inventario.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left">{item.nombre}</td>
                                <td className="py-3 px-6 text-left">{item.cantidad_comprada}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

