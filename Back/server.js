// server.js

import express from 'express';
import cors from 'cors';
import connection from './controller/db.js'; // Importa la conexión a la base de datos

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Ruta para obtener los datos de la tabla Productos
app.get('/productos', (req, res) => {
    const query = `Query`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            res.status(500).json({ error: 'Error al obtener los productos' });
        } else {
            res.json(results);
        }
    });
});

// Ruta para agregar un nuevo producto
app.post('/productos', (req, res) => {
    const { id, nombre, descripcion, categoria, precio, stock, proveedor, fecha_ingreso } = req.body;
    const query = `Query`;
    connection.query(query, [id, nombre, descripcion, categoria, precio, stock, proveedor, fecha_ingreso], (err, results) => {
        if (err) {
            console.error('Error al agregar el producto:', err);
            res.status(500).json({ error: 'Error al agregar el producto' });
        } else {
            res.status(201).json({ message: 'Producto agregado correctamente' });
        }
    });
});

// Ruta para actualizar un producto existente
app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, fecha_ingreso } = req.body;
    const query = `Query`;
    connection.query(query, [nombre, descripcion, precio, stock, fecha_ingreso, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            res.status(500).json({ error: 'Error al actualizar el producto' });
        } else {
            res.json({ message: 'Producto actualizado correctamente' });
        }
    });
});

// Ruta para eliminar un producto
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    const deleteVentasQuery = 'DELETE FROM Ventas WHERE cod_producto = ?';
    const deleteProductoQuery = 'DELETE FROM Productos WHERE producto_id = ?';

    connection.query(deleteVentasQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar las ventas relacionadas:', err);
            res.status(500).json({ error: 'Error al eliminar las ventas relacionadas' });
        } else {
            connection.query(deleteProductoQuery, [id], (err, results) => {
                if (err) {
                    console.error('Error al eliminar el producto:', err);
                    res.status(500).json({ error: 'Error al eliminar el producto' });
                } else {
                    res.json({ message: 'Producto eliminado correctamente' });
                }
            });
        }
    });
});
//Este lo usaba para categorizar losproductos
app.get('/categorias', (req, res) => {
    const query = `Query`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las categorías:', err);
            res.status(500).json({ error: 'Error al obtener las categorías' });
        } else {    
            res.json(results);
        }
    });
});

app.get('/proveedores', (req, res) => {
    const query = `Query`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los proveedores:', err);
            res.status(500).json({ error: 'Error al obtener los proveedores' });
        } else {
            res.json(results);
        }
    });
});

app.post('/ventas', (req, res) => {
    const { clienteId, productos } = req.body; // productos es un array de objetos { productoId, cantidad }
    const queryVenta = 'INSERT INTO Ventas (cliente_id, fecha) VALUES (?, NOW())';
    
    connection.query(queryVenta, [clienteId], (err, results) => {
        if (err) {
            console.error('Error al registrar la venta:', err);
            res.status(500).json({ error: 'Error al registrar la venta' });
        } else {
            const ventaId = results.insertId;
            const queryDetalles = 'INSERT INTO DetallesVenta (venta_id, producto_id, cantidad) VALUES ?';
            const detalles = productos.map(p => [ventaId, p.productoId, p.cantidad]);
            
            connection.query(queryDetalles, [detalles], (err, results) => {
                if (err) {
                    console.error('Error al registrar los detalles de la venta:', err);
                    res.status(500).json({ error: 'Error al registrar los detalles de la venta' });
                } else {
                    // Actualizar el stock de cada producto
                    const updateStockQueries = productos.map(p => {
                        return new Promise((resolve, reject) => {
                            const updateStockQuery = 'UPDATE Productos SET stock = stock - ? WHERE producto_id = ?';
                            connection.query(updateStockQuery, [p.cantidad, p.productoId], (err, results) => {
                                if (err) {
                                    console.error('Error al actualizar el stock del producto:', err);
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    });

                    Promise.all(updateStockQueries)
                        .then(() => {
                            res.status(201).json({ message: 'Venta registrada y stock actualizado correctamente', ventaId });
                        })
                        .catch(error => {
                            res.status(500).json({ error: 'Error al actualizar el stock de los productos' });
                        });
                }
            });
        }
    });
});

// Ruta para calcular el total de una venta
app.get('/ventas/:id/total', (req, res) => {
    const { id } = req.params;
    const query = `Query`;
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al calcular el total de la venta:', err);
            res.status(500).json({ error: 'Error al calcular el total de la venta' });
        } else {
            const total = results[0].total;
            // Aquí podrías aplicar impuestos o descuentos
            res.json({ total });
        }
    });
});

// Ruta para buscar ventas
app.get('/ventas', (req, res) => {
    const { fecha, cliente, producto } = req.query;
    const query = `Query`;
    const params = [];
    if (fecha) {
        query += ' AND DATE(v.fecha) = ?';
        params.push(fecha);
    }
    if (cliente) {
        query += ' AND c.nombre LIKE ?';
        params.push(`%${cliente}%`);
    }
    if (producto) {
        query += ' AND p.nombre LIKE ?';
        params.push(`%${producto}%`);
    }
    query += ' GROUP BY v.venta_id';

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al buscar las ventas:', err);
            res.status(500).json({ error: 'Error al buscar las ventas' });
        } else {
            res.json(results);
        }
    });
});

app.get('/clientes', (req, res) => {
    const query = `Query`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los clientes:', err);
            res.status(500).json({ error: 'Error al obtener los clientes' });
        } else {
            res.json(results);
        }
    });
});

app.post('/clientes', (req, res) => {
    const { nombre, contacto, direccion, telefono, correo } = req.body;
    const query = 'INSERT INTO Clientes (nombre, contacto, direccion, telefono, correo) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [nombre, contacto, direccion, telefono, correo], (err, results) => {
        if (err) {
            console.error('Error al agregar el cliente:', err);
            res.status(500).json({ error: 'Error al agregar el cliente' });
        } else {
            res.status(201).json({ message: 'Cliente agregado correctamente' });
        }
    });
});

//Para actualizar los clientes
app.put('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, contacto, direccion, telefono, correo } = req.body;
    const query = 'UPDATE Clientes SET nombre = ?, contacto = ?, direccion = ?, telefono = ?, correo = ? WHERE cliente_id = ?';
    connection.query(query, [nombre, contacto, direccion, telefono, correo, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar el cliente:', err);
            res.status(500).json({ error: 'Error al actualizar el cliente' });
        } else {
            res.json({ message: 'Cliente actualizado correctamente' });
        }
    });
});

//Borra un cliente
app.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Clientes WHERE cliente_id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar el cliente:', err);
            res.status(500).json({ error: 'Error al eliminar el cliente' });
        } else {
            res.json({ message: 'Cliente eliminado correctamente' });
        }
    });
});

//BUsca un cliente
app.get('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT cliente_id AS id, nombre, contacto, direccion, telefono, correo FROM Clientes WHERE cliente_id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el cliente:', err);
            res.status(500).json({ error: 'Error al obtener el cliente' });
        } else {
            res.json(results[0]);
        }
    });
});

app.get('/clientes/:id/compras', (req, res) => {
    const { id } = req.params;
    const query = `Query`;
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el historial de compras:', err);
            res.status(500).json({ error: 'Error al obtener el historial de compras' });
        } else {
            res.json(results);
        }
    });
});


// Ruta para obtener los productos comprados en el inventario
app.get('/inventario', (req, res) => {
    const query = `Query`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener el inventario:', err);
            res.status(500).json({ error: 'Error al obtener el inventario' });
        } else {
            res.json(results);
        }
    });
});
//Confirma que si esta conectado con el server.
app.listen(port, () => {
    //console.log(`Servidor escuchando en http://localhost:${port}`);
});