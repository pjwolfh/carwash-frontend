const db = require('../db/connection');
const bcrypt = require('bcrypt');
const { enviarCorreoDueño } = require('../utils/mailer');

// 🔁 Generar ID único
const generarUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// 🔁 Obtener todos los usuarios con rol de DUEÑO (rol_id = 3)
const obtenerClientes = (req, res) => {
  const query = 'SELECT * FROM usuarios WHERE rol_id = 3';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 🔍 Obtener un usuario por ID
const obtenerClientePorId = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM usuarios WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(results[0]);
  });
};

// ✅ Crear un nuevo dueño (usuario)
const crearCliente = async (req, res) => {
  const { nombre_empresa, nombre_contacto, telefono, email, password, rol_id = 3 } = req.body;
  const passwordPlano = password; // 👈 guardamos antes de cifrar

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = generarUserId();

  const query = `
    INSERT INTO usuarios 
    (nombre_empresa, nombre_contacto, telefono, email, password, rol_id, servicios_acumulados, puntos, user_id)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)
  `;

  db.query(query, [nombre_empresa, nombre_contacto, telefono, email, hashedPassword, rol_id, userId], async (err, result) => {
    if (err) return res.status(500).json({ error: err });

    console.log("✉️ Preparando envío de correo con:", {
      email,
      nombre_contacto,
      passwordPlano,
      nombre_empresa,
      telefono
    });

    await enviarCorreoDueño(email, nombre_contacto, passwordPlano, nombre_empresa, telefono);

    res.json({ mensaje: 'Cliente (dueño) creado exitosamente', id: result.insertId });
  });
};


// ✏️ Editar un dueño
const editarCliente = (req, res) => {
  const { id } = req.params;
  const { nombre_empresa, nombre_contacto, telefono, email } = req.body;

  const query = `
    UPDATE usuarios 
    SET nombre_empresa = ?, nombre_contacto = ?, telefono = ?, email = ?
    WHERE id = ?
  `;

  db.query(query, [nombre_empresa, nombre_contacto, telefono, email, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Cliente actualizado correctamente' });
  });
};

// ❌ Eliminar un dueño
const eliminarCliente = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM usuarios WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  });
};

// 🧼 Obtener servicios por usuario (dueño)
const obtenerServiciosPorCliente = (req, res) => {
  const { clienteId } = req.params;

  const query = `
    SELECT s.*
    FROM servicios s
    INNER JOIN sucursales su ON s.id_sucursal = su.id_sucursal
    WHERE su.id_usuario = ?
  `;

  db.query(query, [clienteId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 📊 Ventas del día por usuario
const obtenerVentasDelDiaPorCliente = (req, res) => {
  const { clienteId } = req.params;

  const query = `
    SELECT COUNT(*) AS cantidad, COALESCE(SUM(v.monto_total), 0) AS total
    FROM ventas v
    INNER JOIN sucursales su ON v.id_sucursal = su.id_sucursal
    WHERE su.id_usuario = ?
      AND DATE(v.fecha_hora) = CURDATE()
  `;

  db.query(query, [clienteId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
};

// 🔐 Obtener credenciales del dueño
const getUsuarioPorCliente = (req, res) => {
  const { clienteId } = req.params;

  const query = `
    SELECT password, rol_id, email
    FROM usuarios
    WHERE id = ?
  `;

  db.query(query, [clienteId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(results[0]);
  });
};

// 🔁 Reset de contraseña a "123456"
const resetearPasswordCliente = async (req, res) => {
  const { id } = req.params;
  const nuevaPassword = '123456';

  try {
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    const query = 'UPDATE usuarios SET password = ? WHERE id = ?';

    db.query(query, [hashedPassword, id], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ mensaje: 'Contraseña reseteada exitosamente' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el reseteo de contraseña' });
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  editarCliente,
  eliminarCliente,
  obtenerServiciosPorCliente,
  obtenerVentasDelDiaPorCliente,
  getUsuarioPorCliente,
  resetearPasswordCliente
};
