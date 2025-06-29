const db = require('../db/connection');

// ✅ Obtener TODAS las sucursales (solo superadmin usaría esto)
const obtenerTodasSucursales = (req, res) => {
  const query = 'SELECT * FROM sucursales';

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ✅ Obtener sucursales de un cliente específico
const obtenerSucursalesPorCliente = (req, res) => {
  const { idCliente } = req.params;
  const query = 'SELECT * FROM sucursales WHERE id_cliente = ?';

  db.query(query, [idCliente], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// ✅ Crear nueva sucursal
const crearSucursal = (req, res) => {
  const {
    id_cliente,
    nombre_sucursal,
    direccion,
    ubicacion_gps,
    encargado_nombre,
    encargado_telefono,
    encargado_email
  } = req.body;

  const query = `
    INSERT INTO sucursales (
      id_cliente, nombre_sucursal, direccion, ubicacion_gps,
      encargado_nombre, encargado_telefono, encargado_email
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    id_cliente,
    nombre_sucursal,
    direccion,
    ubicacion_gps,
    encargado_nombre,
    encargado_telefono,
    encargado_email
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Sucursal creada correctamente', id: result.insertId });
  });
};

// ✅ Editar sucursal
const editarSucursal = (req, res) => {
const idSucursal = req.params.id;
  const {
    nombre_sucursal,
    direccion,
    ubicacion_gps,
    encargado_nombre,
    encargado_telefono,
    encargado_email
  } = req.body;

  const query = `
    UPDATE sucursales
    SET nombre_sucursal = ?, direccion = ?, ubicacion_gps = ?, 
        encargado_nombre = ?, encargado_telefono = ?, encargado_email = ?
    WHERE id_sucursal = ?
  `;

  db.query(query, [
    nombre_sucursal,
    direccion,
    ubicacion_gps,
    encargado_nombre,
    encargado_telefono,
    encargado_email,
    idSucursal
  ], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Sucursal actualizada correctamente' });
  });
};

// ✅ Eliminar sucursal
const eliminarSucursal = (req, res) => {
  const { idSucursal } = req.params;
  const query = 'DELETE FROM sucursales WHERE id_sucursal = ?';

  db.query(query, [idSucursal], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: 'Sucursal eliminada correctamente' });
  });
};

// ✅ Obtener resumen de ventas por sucursal (día, semana, mes)
const obtenerResumenSucursal = (req, res) => {
  const idSucursal = req.params.id;

  if (!idSucursal) {
    return res.status(400).json({ error: 'ID de sucursal requerido' });
  }

  const sql = `
    SELECT 
      (SELECT IFNULL(SUM(monto_total), 0) FROM ventas WHERE id_sucursal = ? AND DATE(fecha_hora) = CURDATE() AND estado_confirmacion = 'confirmada') AS ventas_dia,
      (SELECT IFNULL(SUM(monto_total), 0) FROM ventas WHERE id_sucursal = ? AND WEEK(fecha_hora) = WEEK(CURDATE()) AND estado_confirmacion = 'confirmada') AS ventas_semana,
      (SELECT IFNULL(SUM(monto_total), 0) FROM ventas WHERE id_sucursal = ? AND MONTH(fecha_hora) = MONTH(CURDATE()) AND estado_confirmacion = 'confirmada') AS ventas_mes,
      (SELECT COUNT(*) FROM empleados WHERE id_sucursal = ?) AS empleados_activos
  `;

  db.query(sql, [idSucursal, idSucursal, idSucursal, idSucursal], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener resumen de sucursal:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    res.json(results[0]);
  });
};


// ✅ Obtener sucursal por ID
const obtenerSucursalPorId = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM sucursales WHERE id_sucursal = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener sucursal:', err);
      return res.status(500).json({ error: 'Error al obtener la sucursal' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }
    res.json(results[0]);
  });
};

// ✅ Exportar todo (NO repitas module.exports arriba)
module.exports = {
  obtenerTodasSucursales,
  obtenerSucursalesPorCliente,
  crearSucursal,
  editarSucursal,
  eliminarSucursal,
  obtenerSucursalPorId,     // ✅ este es el que probablemente está fallando
  obtenerResumenSucursal
};

