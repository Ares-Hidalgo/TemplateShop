'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [compras, setCompras] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [clientsPerPage] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCliente, setNewCliente] = useState({
        nombre: '',
        contacto: '',
        direccion: '',
        telefono: '',
        correo: ''
    });

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await fetch('http://localhost:3001/clientes');
            if (!response.ok) {
                throw new Error('Error al obtener los clientes');
            }
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error('Error al obtener los clientes:', error);
            setClientes([]);
        }
    };

    const handleSelectCliente = (cliente) => {
        setSelectedCliente(cliente);
        setShowEditModal(true);
    };

    const handleUpdateCliente = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3001/clientes/${selectedCliente.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedCliente),
            });
            if (!response.ok) {
                throw new Error('Error al actualizar el cliente');
            }
            await fetchClientes();
            setShowEditModal(false);
        } catch (error) {
            console.error('Error al actualizar el cliente:', error);
        }
    };

    const handleShowHistory = (cliente) => {
        setSelectedCliente(cliente);
        fetch(`http://localhost:3001/clientes/${cliente.id}/compras`)
            .then(response => response.json())
            .then(data => {
                setCompras(data);
                setShowHistoryModal(true);
            })
            .catch(error => console.error('Error fetching purchase history:', error));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente && cliente.nombre && cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClientes.slice(indexOfFirstClient, indexOfLastClient);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAddCliente = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCliente),
            });
            if (!response.ok) {
                throw new Error('Error al agregar el cliente');
            }
            setNewCliente({
                nombre: '',
                contacto: '',
                direccion: '',
                telefono: '',
                correo: ''
            });
            setShowAddModal(false);
            fetchClientes(); // Refrescar la lista de clientes
        } catch (error) {
            console.error('Error al agregar el cliente:', error);
        }
    };

    // Calcular el total de las compras
    const totalCompras = compras.reduce((acc, compra) => acc + parseFloat(compra.total || 0), 0);

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Gestión de Clientes</h1>
            <Link href="/" className="inline-block mb-4 p-2 bg-primary text-white rounded hover:bg-primary-dark items-center">
                <FaArrowLeft className="mr-2" />
                <span className="sr-only">Regresar al Inicio</span>
            </Link>
            <button onClick={() => setShowAddModal(true)} className="flex mb-2 p-2 bg-primary text-white rounded-full hover:bg-secondary-dark">
                <FaPlus />
            </button>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-3 border rounded w-full shadow-sm"
                />
            </div>
            <table className="w-full bg-white shadow-md rounded mb-4">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">ID</th>
                        <th className="py-3 px-6 text-left">Nombre</th>
                        <th className="py-3 px-6 text-left">Contacto</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {currentClients.map(cliente => (
                        <tr key={cliente.id} className="border-b border-gray-200 hover:bg-gray-100">
                            <td className="py-3 px-6 text-left">{cliente.id}</td>
                            <td className="py-3 px-6 text-left">{cliente.nombre}</td>
                            <td className="py-3 px-6 text-left">{cliente.contacto}</td>
                            <td className="py-3 px-6 text-center">
                                <button onClick={() => handleSelectCliente(cliente)} className="mr-2 p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">Ver</button>
                                <button onClick={() => handleShowHistory(cliente)} className="p-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition">Historial</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(filteredClientes.length / clientsPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`mx-1 px-3 py-1 rounded shadow ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {showEditModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Editar Cliente</h2>
                        <form onSubmit={handleUpdateCliente}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={selectedCliente.nombre}
                                        onChange={(e) => setSelectedCliente({ ...selectedCliente, nombre: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Contacto</label>
                                    <input
                                        type="text"
                                        value={selectedCliente.contacto}
                                        onChange={(e) => setSelectedCliente({ ...selectedCliente, contacto: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        value={selectedCliente.direccion}
                                        onChange={(e) => setSelectedCliente({ ...selectedCliente, direccion: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={selectedCliente.telefono}
                                        onChange={(e) => setSelectedCliente({ ...selectedCliente, telefono: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Correo</label>
                                    <input
                                        type="email"
                                        value={selectedCliente.correo}
                                        onChange={(e) => setSelectedCliente({ ...selectedCliente, correo: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => setShowEditModal(false)} className="mr-2 p-2 bg-gray-300 rounded shadow">Cancelar</button>
                                <button type="submit" className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showHistoryModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Historial de Compras</h2>
                        <h3 className="text-md font-bold mb-4">Cliente: {selectedCliente.nombre}</h3>
                        {compras.length > 0 ? (
                            <table className="w-full bg-white shadow-md rounded mb-4">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                        <th className="py-3 px-6 text-left">ID Venta</th>
                                        <th className="py-3 px-6 text-left">Fecha</th>
                                        <th className="py-3 px-6 text-left">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm font-light">
                                    {compras.map(compra => (
                                        <tr key={compra.venta_id} className="border-b border-gray-200 hover:bg-gray-100">
                                            <td className="py-3 px-6 text-left">{compra.venta_id}</td>
                                            <td className="py-3 px-6 text-left">{new Date(compra.fecha).toLocaleDateString()}</td>
                                            <td className="py-3 px-6 text-left">{compra.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-600 text-center">Este cliente no tiene ventas registradas.</p>
                        )}
                        <div className="flex justify-between mt-4">
                            <span className="text-lg font-bold">Total de Compras: ${totalCompras.toFixed(2)}</span>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-gray-300 rounded shadow">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Agregar Cliente</h2>
                        <form onSubmit={handleAddCliente}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={newCliente.nombre}
                                        onChange={(e) => setNewCliente({ ...newCliente, nombre: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Contacto</label>
                                    <input
                                        type="text"
                                        value={newCliente.contacto}
                                        onChange={(e) => setNewCliente({ ...newCliente, contacto: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        value={newCliente.direccion}
                                        onChange={(e) => setNewCliente({ ...newCliente, direccion: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={newCliente.telefono}
                                        onChange={(e) => setNewCliente({ ...newCliente, telefono: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Correo</label>
                                    <input
                                        type="email"
                                        value={newCliente.correo}
                                        onChange={(e) => setNewCliente({ ...newCliente, correo: e.target.value })}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => setShowAddModal(false)} className="mr-2 p-2 bg-gray-300 rounded shadow">Cancelar</button>
                                <button type="submit" className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">Agregar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}   
