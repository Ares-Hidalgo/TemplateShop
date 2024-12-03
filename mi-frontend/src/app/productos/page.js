// src/app/productos/page.js

'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [form, setForm] = useState({
        id: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: '',
        stock: '',
        proveedor: '',
        fecha_ingreso: ''
    });
    const [editing, setEditing] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);

    useEffect(() => {
        fetchProductos();
        fetchCategorias();
        fetchProveedores();
    }, []);

    const fetchProductos = async () => {
        try {
            const response = await fetch('http://localhost:3001/productos');
            if (!response.ok) {
                throw new Error('Error al obtener los productos');
            }
            const data = await response.json();
            setProductos(data);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await fetch('http://localhost:3001/categorias');
            if (!response.ok) {
                throw new Error('Error al obtener las categorías');
            }
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error al obtener las categorías:', error);
        }
    };

    const fetchProveedores = async () => {
        try {
            const response = await fetch('http://localhost:3001/proveedores');
            if (!response.ok) {
                throw new Error('Error al obtener los proveedores');
            }
            const data = await response.json();
            setProveedores(data);
        } catch (error) {
            console.error('Error al obtener los proveedores:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value || '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editing !== null ? 'PUT' : 'POST';
            const url = editing !== null ? `http://localhost:3001/productos/${editing}` : 'http://localhost:3001/productos';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            if (!response.ok) {
                throw new Error('Error al guardar el producto');
            }
            setForm({
                nombre: '',
                descripcion: '',
                categoria: '',
                precio: '',
                stock: '',
                proveedor: '',
                fecha_ingreso: ''
            });
            setEditing(null);
            fetchProductos();
            setShowEditModal(false);
            setShowAddModal(false);
        } catch (error) {
            console.error('Error al guardar el producto:', error);
        }
    };

    const handleEdit = (producto) => {
        setForm({
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            categoria: producto.categoria || '',
            precio: producto.precio || '',
            stock: producto.stock || '',
            proveedor: producto.proveedor || '',
            fecha_ingreso: producto.fecha_ingreso || ''
        });
        setEditing(producto.id);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/productos/${selectedProduct.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Error al eliminar el producto');
            }
            fetchProductos();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredProducts = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Gestión de Productos</h1>
            <Link href="/" className="inline-block mb-2 p-2 bg-primary text-white rounded hover:bg-primary-dark items-center">
                <FaArrowLeft className="mr-2" />
                <span className="sr-only">Regresar al Inicio</span>
            </Link>
            <button onClick={() => setShowAddModal(true)} className="flex mb-2 p-2 bg-primary text-white rounded-full hover:bg-secondary-dark">
                    <FaPlus />
                </button>
            <input
                type="text"
                placeholder="Buscar por nombre"
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-3 p-3 border rounded w-full shadow-sm"
            />
            <div>
                

                {/* Modal para agregar productos */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded w-full max-w-lg">
                            <h2 className="text-lg font-bold mb-4 text-primary-dark">Agregar Producto</h2>
                            <form onSubmit={handleSubmit} className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="id"
                                        value={form.id}
                                        onChange={handleInputChange}
                                        placeholder="ID del producto"
                                        className="p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Nombre del producto"
                                        className="p-2 border rounded"
                                        required
                                    />
                                    <textarea
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleInputChange}
                                        placeholder="Descripción del producto"
                                        className="p-2 border rounded"
                                        required
                                    />
                                    <select
                                        name="categoria"
                                        value={form.categoria}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded"
                                        required
                                    >
                                        <option value="">Seleccione una categoría</option>
                                        {categorias.map((categoria) => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={form.precio}
                                        onChange={handleInputChange}
                                        placeholder="Precio"
                                        className="p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleInputChange}
                                        placeholder="Cantidad en stock"
                                        className="p-2 border rounded"
                                        required
                                    />
                                    <select
                                        name="proveedor"
                                        value={form.proveedor}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded"
                                        required
                                    >
                                        <option value="">Seleccione un proveedor</option>
                                        {proveedores.map((proveedor) => (
                                            <option key={proveedor.id} value={proveedor.id}>
                                                {proveedor.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="date"
                                        name="fecha_ingreso"
                                        value={form.fecha_ingreso}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button onClick={() => setShowAddModal(false)} className="mr-2 p-2 bg-gray-300 rounded">Cancelar</button>
                                    <button type="submit" className="p-2 bg-primary text-white rounded hover:bg-primary-dark">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
           {/* Tabla de productos */}
            <table className="w-full bg-white shadow-md rounded mb-4">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">ID</th>
                        <th className="py-3 px-6 text-left">Nombre</th>
                        <th className="py-3 px-6 text-left">Descripción</th>
                        <th className="py-3 px-6 text-left">Categoría</th>
                        <th className="py-3 px-6 text-left">Precio</th>
                        <th className="py-3 px-6 text-left">Stock</th>
                        <th className="py-3 px-6 text-left">Proveedor</th>
                        <th className="py-3 px-6 text-left">Fecha de Ingreso</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {currentProducts.map((producto) => (
                        <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-100">
                            <td className="py-3 px-6 text-left">{producto.id}</td>
                            <td className="py-3 px-6 text-left">{producto.nombre}</td>
                            <td className="py-3 px-6 text-left">{producto.descripcion}</td>
                            <td className="py-3 px-6 text-left">{producto.categoria}</td>
                            <td className="py-3 px-6 text-left">{producto.precio}</td>
                            <td className="py-3 px-6 text-left">{producto.stock}</td>
                            <td className="py-3 px-6 text-left">{producto.proveedor}</td>
                            <td className="py-3 px-6 text-left">{producto.fecha_ingreso}</td>
                            <td className="py-3 px-6 text-center">
                                <button onClick={() => handleEdit(producto)} className="mr-2 p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">Editar</button>
                                <button onClick={() => { setSelectedProduct(producto); setShowDeleteModal(true); }} className="p-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Modal para eliminar */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded">
                        <h2 className="text-lg font-bold">Confirmar Eliminación</h2>
                        <p>¿Estás seguro de que deseas eliminar este producto?</p>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setShowDeleteModal(false)} className="mr-2 p-2 bg-gray-300 rounded">Cancelar</button>
                            <button onClick={handleDelete} className="p-2 bg-red-500 text-white rounded">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para editar */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded">
                        <h2 className="text-lg font-bold">Editar Producto</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Nombre del producto"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1">Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleInputChange}
                                        placeholder="Descripción del producto"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Precio</label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={form.precio}
                                        onChange={handleInputChange}
                                        placeholder="Precio"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleInputChange}
                                        placeholder="Cantidad en stock"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Fecha de Ingreso</label>
                                    <input
                                        type="date"
                                        name="fecha_ingreso"
                                        value={form.fecha_ingreso}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => setShowEditModal(false)} className="mr-2 p-2 bg-gray-300 rounded">Cancelar</button>
                                <button type="submit" className="p-2 bg-blue-500 text-white rounded">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded w-full max-w-lg">
                        <h2 className="text-lg font-bold mb-4">Agregar Producto</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">ID del producto</label>
                                    <input
                                        type="text"
                                        name="id"
                                        value={form.id}
                                        onChange={handleInputChange}
                                        placeholder="ID del producto"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Nombre del producto"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1">Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleInputChange}
                                        placeholder="Descripción del producto"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Categoría</label>
                                    <select
                                        name="categoria"
                                        value={form.categoria}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded w-full"
                                        required
                                    >
                                        <option value="">Seleccione una categoría</option>
                                        {categorias.map((categoria) => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1">Precio</label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={form.precio}
                                        onChange={handleInputChange}
                                        placeholder="Precio"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Stock</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleInputChange}
                                        placeholder="Cantidad en stock"
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Proveedor</label>
                                    <select
                                        name="proveedor"
                                        value={form.proveedor}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded w-full"
                                        required
                                    >
                                        <option value="">Seleccione un proveedor</option>
                                        {proveedores.map((proveedor) => (
                                            <option key={proveedor.id} value={proveedor.id}>
                                                {proveedor.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1">Fecha de Ingreso</label>
                                    <input
                                        type="date"
                                        name="fecha_ingreso"
                                        value={form.fecha_ingreso}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => setShowAddModal(false)} className="mr-2 p-2 bg-gray-300 rounded">Cancelar</button>
                                <button type="submit" className="p-2 bg-primary text-white rounded hover:bg-primary-dark">Agregar Producto</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}