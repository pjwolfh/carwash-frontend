const db = require('../db/connection');

// 🔹 Obtener todos los servicios (nuevo endpoint para home)
const obtenerTodosLosServicios = (req, res) => {
  db.query('SELECT * FROM servicios', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener todos los servicios:', err);
      return res.status(500).json({ error: 'Error al obtener los servicios' });
    }
    res.json(results);
  });
};


// Obtener servicios por sucursal
const obtenerServicios = (req, res) => {
  const id_sucursal = req.params.id_sucursal;
  db.query('SELECT * FROM servicios WHERE id_sucursal = ?', [id_sucursal], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener servicios:', err);
      return res.status(500).json({ error: 'Error al obtener los servicios de la sucursal' });
    }
    res.json(results);
  });
};


// Agregar nuevo servicio
const agregarServicio = (req, res) => {
  const { nombre_servicio, precio, detalles, puntos, imagen, id_sucursal } = req.body;

  const sql = 'INSERT INTO servicios (nombre_servicio, precio, detalles, puntos, imagen, id_sucursal) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nombre_servicio, precio, detalles, puntos, imagen, id_sucursal], (err, result) => {
    if (err) {
      console.error('❌ Error al agregar servicio:', err);
      return res.status(500).json({ error: 'Error al agregar servicio' });
    }
    res.json({ success: true, id: result.insertId });
  });
};



// 🔹 Editar servicio
const editarServicio = (req, res) => {
  const id = req.params.id;
  const { nombre_servicio, precio, detalles, puntos, imagen } = req.body;

  const sql = 'UPDATE servicios SET nombre_servicio = ?, precio = ?, detalles = ?, puntos = ?, imagen = ? WHERE id = ?';
  db.query(sql, [nombre_servicio, precio, detalles, puntos, imagen, id], (err) => {
    if (err) {
      console.error('❌ Error al editar servicio:', err);
      return res.status(500).json({ error: 'Error al editar servicio' });
    }
    res.json({ success: true });
  });
};

// 🔹 Eliminar servicio
const eliminarServicio = (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM servicios WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('❌ Error al eliminar servicio:', err);
      return res.status(500).json({ error: 'Error al eliminar servicio' });
    }
    res.json({ success: true });
  });
};


// 📦 Exportar funciones
module.exports = {
  obtenerTodosLosServicios,
  obtenerServicios,
  agregarServicio,
  editarServicio,
  eliminarServicio
};
