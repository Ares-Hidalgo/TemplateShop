'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaEye, FaPlus  } from 'react-icons/fa';   

export default function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedProductoId, setSelectedProductoId] = useState('');
    const [productoValido, setProductoValido] = useState(null);
    const [selectedClienteId, setSelectedClienteId] = useState('');
    const [clienteValido, setClienteValido] = useState(null);
    const [searchParams, setSearchParams] = useState({ fecha: '', cliente: '', producto: '' });
    const [newVenta, setNewVenta] = useState({ clienteId: '', productos: [] });
    const [showClientModal, setShowClientModal] = useState(false);
    const [showVentaModal, setShowVentaModal] = useState(false);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [totalVenta, setTotalVenta] = useState(0);
    const [newCliente, setNewCliente] = useState({
        nombre: '',
        contacto: '',
        direccion: '',
        telefono: '',
        correo: ''
    });

    useEffect(() => {
        fetchVentas();
        fetchClientes();
        fetchProductos();
        fetchCategorias();
    }, []);

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams({ ...searchParams, [name]: value });
    };

    const filteredVentas = ventas.filter(venta => {
        const matchesFecha = searchParams.fecha ? venta.fecha.startsWith(searchParams.fecha) : true;
        const matchesCliente = searchParams.cliente ? venta.cliente.toLowerCase().includes(searchParams.cliente.toLowerCase()) : true;
        return matchesFecha && matchesCliente;
    });

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

    const fetchClientes = async () => {
        try {
            const response = await fetch('http://localhost:3001/clientes');
            if (!response.ok) throw new Error('Error al obtener los clientes');
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error('Error al obtener los clientes:', error);
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await fetch('http://localhost:3001/productos');
            if (!response.ok) throw new Error('Error al obtener los productos');
            const data = await response.json();
            setProductos(data);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await fetch('http://localhost:3001/categorias');
            if (!response.ok) throw new Error('Error al obtener las categorías');
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error al obtener las categorías:', error);
        }
    };

    const handleNewVentaChange = (e) => {
        const { name, value } = e.target;
        setNewVenta({ ...newVenta, [name]: value });
    };

    const handleProductoIdChange = (e) => {
        const productoId = e.target.value;
        setSelectedProductoId(productoId);
        const producto = productos.find(p => p.id === parseInt(productoId));
        setProductoValido(producto || null);
    };

    const handleClienteIdChange = (e) => {
        const clienteId = e.target.value;
        setSelectedClienteId(clienteId);
        const cliente = clientes.find(c => c.id === parseInt(clienteId));
        setClienteValido(cliente || null);
        setNewVenta(prev => ({ ...prev, clienteId: cliente ? cliente.id : '' }));
    };

    const handleAddProductToVenta = () => {
        if (!productoValido) return;

        const cantidad = parseInt(document.getElementById('cantidad').value);
        if (cantidad <= 0) return;

        if (productoValido.stock < cantidad) {
            alert(`No hay suficiente stock para el producto: ${productoValido.nombre}`);
            return;
        }

        const existingProductIndex = newVenta.productos.findIndex(p => p.productoId === productoValido.id);

        if (existingProductIndex >= 0) {
            const updatedProductos = [...newVenta.productos];
            updatedProductos[existingProductIndex].cantidad += cantidad;
            setNewVenta(prev => ({ ...prev, productos: updatedProductos }));
        } else {
            setNewVenta(prev => ({
                ...prev,
                productos: [...prev.productos, { productoId: productoValido.id, nombre: productoValido.nombre, cantidad, costo: productoValido.precio }]
            }));
        }

        setTotalVenta(prevTotal => prevTotal + (productoValido.precio * cantidad));
    };

    const handleShowProductModal = async (ventaId) => {
        try {
            const response = await fetch(`http://localhost:3001/ventas/${ventaId}/productos`);
            if (!response.ok) throw new Error('Error al obtener los productos de la venta');
            const data = await response.json();
            setSelectedProducts(data);
            setShowProductModal(true);
        } catch (error) {
            console.error('Error al obtener los productos de la venta:', error);
        }
    };

    const handleRegisterVenta = async () => {
        try {
            const response = await fetch('http://localhost:3001/ventas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newVenta),
            });

            if (!response.ok) throw new Error('Error al registrar la venta');
            const data = await response.json();
            console.log('Venta registrada correctamente:', data);
            setShowVentaModal(false);
            fetchVentas(); // Actualiza la lista de ventas
        } catch (error) {
            console.error('Error al registrar la venta:', error);
        }
    };

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

            if (!response.ok) throw new Error('Error al agregar el cliente');
            const data = await response.json();
            console.log('Cliente agregado correctamente:', data);
            setShowNewClientModal(false);
            fetchClientes(); // Actualiza la lista de clientes
        } catch (error) {
            console.error('Error al agregar el cliente:', error);
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Gestión de Ventas</h1>
            <Link href="/" className="inline-block mb-4 p-2 bg-primary text-white rounded hover:bg-primary-dark items-center">
                <FaArrowLeft className="mr-2" />
                <span className="sr-only">Regresar al Inicio</span>
            </Link>
            <button onClick={() => setShowVentaModal(true)} className="flex mb-2 p-2 bg-primary text-white rounded-full hover:bg-secondary-dark">
                <FaPlus />
            </button>
            {/* Formulario de búsqueda */}
            <div className="mb-4">
                <input
                    type="date"
                    name="fecha"
                    value={searchParams.fecha}
                    onChange={handleSearchChange}
                    placeholder="Buscar por fecha"
                    className="mr-2 p-3 border rounded shadow-sm"
                />
                <input
                    type="text"
                    name="cliente"
                    value={searchParams.cliente}
                    onChange={handleSearchChange}
                    placeholder="Buscar por cliente"
                    className="p-3 border rounded shadow-sm"
                />
            </div>
            <table className="w-full bg-white shadow-md rounded mb-4">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">ID Venta</th>
                        <th className="py-3 px-6 text-left">Fecha</th>
                        <th className="py-3 px-6 text-left">Cliente</th>
                        <th className="py-3 px-6 text-left">Total</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {filteredVentas.map(venta => (
                        <tr key={venta.venta_id} className="border-b border-gray-200 hover:bg-gray-100">
                            <td className="py-3 px-6 text-left">{venta.venta_id}</td>
                            <td className="py-3 px-6 text-left">{new Date(venta.fecha).toLocaleDateString()}</td>
                            <td className="py-3 px-6 text-left">{venta.cliente}</td>
                            <td className="py-3 px-6 text-left">{venta.total}</td>
                            <td className="py-3 px-6 text-center">
                                <button onClick={() => handleShowProductModal(venta.venta_id)} className="p-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition">
                                    <FaEye />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                {/* Modal para registrar nueva venta */}
            {showVentaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Registrar Nueva Venta</h2>
                        <div className="mb-4">
                            <label className="block mb-2">ID del Cliente</label>
                            <input
                                type="text"
                                value={selectedClienteId}
                                onChange={handleClienteIdChange}
                                placeholder="Ingrese el ID del cliente"
                                className="p-2 border rounded w-full"
                            />
                            {clienteValido && (
                                <p className="text-green-500 mt-2">Cliente: {clienteValido.nombre}</p>
                            )}
                            {!clienteValido && selectedClienteId && (
                                <div>
                                    <p className="text-red-500 mt-2">Cliente no encontrado</p>
                                    <button onClick={() => setShowNewClientModal(true)} className="mt-2 p-2 bg-blue-500 text-white rounded">Agregar Nuevo Cliente</button>
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">ID del Producto</label>
                            <input
                                type="text"
                                value={selectedProductoId}
                                onChange={handleProductoIdChange}
                                placeholder="Ingrese el ID del producto"
                                className="p-2 border rounded w-full"
                            />
                            {productoValido && (
                                <p className="text-green-500 mt-2">Producto: {productoValido.nombre}</p>
                            )}
                            {!productoValido && selectedProductoId && (
                                <p className="text-red-500 mt-2">Producto no encontrado</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Cantidad</label>
                            <input
                                id="cantidad"
                                type="number"
                                min="1"
                                placeholder="Cantidad"
                                className="p-2 border rounded w-full"
                            />
                        </div>
                        <button onClick={handleAddProductToVenta} className="p-2 bg-blue-500 text-white rounded">Agregar Producto</button>
                        
                        {/* Lista de productos agregados */}
                        <div className="mt-4">
                            <h3 className="text-lg font-bold mb-2">Productos Agregados</h3>
                            <ul className="list-disc pl-5">
                                {newVenta.productos.map((producto, index) => (
                                    <li key={index} className="mb-2">
                                        {producto.nombre} - Cantidad: {producto.cantidad} - Costo: ${(producto.costo * producto.cantidad).toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-4">
                            <strong>Total de la Venta: </strong>${totalVenta.toFixed(2)}
                        </div>
                        <button onClick={handleRegisterVenta} className="mt-4 p-2 bg-primary text-white rounded">Registrar Venta</button>
                        <button onClick={() => setShowVentaModal(false)} className="ml-2 mt-4 p-2 bg-red-500 text-white rounded">Cancelar</button>
                    </div>
                </div>
            )}

            {/* Modal para agregar nuevo cliente */}
            {showNewClientModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Agregar Nuevo Cliente</h2>
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
                                <button onClick={() => setShowNewClientModal(false)} className="mr-2 p-2 bg-gray-300 rounded shadow">Cancelar</button>
                                <button type="submit" className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">Agregar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showProductModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Productos Comprados</h2>
                        <table className="w-full bg-white shadow-md rounded mb-4">
                            <thead>
                                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Producto</th>
                                    <th className="py-3 px-6 text-left">Cantidad</th>
                                    <th className="py-3 px-6 text-left">Costo</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {selectedProducts.map((producto, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left">{producto.nombre}</td>
                                        <td className="py-3 px-6 text-left">{producto.cantidad}</td>
                                        <td className="py-3 px-6 text-left">{producto.costo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setShowProductModal(false)} className="mt-4 p-2 bg-red-500 text-white rounded">Cerrar</button>
                    </div>
                    </div>
                )}
            </div>
        </div>
        
        
    );
}