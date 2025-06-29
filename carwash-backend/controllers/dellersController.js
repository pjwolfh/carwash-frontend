const db = require('../db/connection');
const path = require('path');

// 🔹 Obtener todos los Dellers
const obtenerDellers = (req, res) => {
  db.query('SELECT * FROM dellers', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener todos los dellers:', err);
      return res.status(500).json({ error: 'No se pudo obtener la lista de dellers' });
    }
    res.json(results);
  });
};

// 🔹 Obtener un Deller por ID
const obtenerDellerPorId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM dellers WHERE id_deller = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener deller por ID:', err);
      return res.status(500).json({ error: 'No se pudo obtener el deller' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Deller no encontrado' });
    }
    res.json(results[0]);
  });
};

// 🔹 Agregar un nuevo Deller
const agregarDeller = (req, res) => {
  const { id_sucursal, nombre, correo, telefono } = req.body;
  if (!id_sucursal || !nombre) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const sql = `
    INSERT INTO dellers (id_sucursal, nombre, correo, telefono)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [id_sucursal, nombre, correo, telefono], (err, result) => {
    if (err) {
      console.error('❌ Error al agregar deller:', err);
      return res.status(500).json({ error: 'No se pudo agregar el deller' });
    }

    res.json({ success: true, mensaje: '✅ Deller agregado correctamente', id: result.insertId });
  });
};

// 🔹 Obtener Dellers por sucursal
const obtenerDellersPorSucursal = (req, res) => {
  const { id_sucursal } = req.params;

  db.query('SELECT * FROM dellers WHERE id_sucursal = ?', [id_sucursal], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener dellers:', err);
      return res.status(500).json({ error: 'No se pudo obtener la lista de dellers' });
    }

    res.json(results);
  });
};

// 🔹 Agregar una entrada de Bitácora con fotos y adicionales
const agregarBitacora = (req, res) => {
  const { id_deller, vehiculo, bin, precio, adicionales } = req.body;

  if (!id_deller || !vehiculo || !bin || !precio) {
    return res.status(400).json({ error: 'Datos incompletos para la bitácora' });
  }

  const fotos = [];
  for (let i = 1; i <= 4; i++) {
    const file = req.files?.[`foto${i}`]?.[0];
    if (file) {
      const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      fotos.push(url);
    } else {
      fotos.push(null);
    }
  }

  const sql = `
    INSERT INTO bitacora_vehiculos 
    (id_deller, vehiculo, bin, precio, adicionales, foto1, foto2, foto3, foto4)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [id_deller, vehiculo, bin, precio, adicionales, ...fotos],
    (err) => {
      if (err) {
        console.error('❌ Error al guardar bitácora:', err);
        return res.status(500).json({ error: 'No se pudo guardar la bitácora' });
      }

      res.json({ success: true, mensaje: '✅ Bitácora registrada correctamente' });
    }
  );
};

// 🔹 Obtener bitácoras por Deller
const obtenerBitacorasPorDeller = (req, res) => {
  const { id_deller } = req.params;

  db.query(
    'SELECT * FROM bitacora_vehiculos WHERE id_deller = ? ORDER BY fecha_registro DESC',
    [id_deller],
    (err, results) => {
      if (err) {
        console.error('❌ Error al obtener bitácoras:', err);
        return res.status(500).json({ error: 'No se pudo obtener la bitácora' });
      }

      res.json(results);
    }
  );
};

// 🔹 Actualizar Deller
const actualizarDeller = (req, res) => {
  const { id } = req.params;
  const { nombre, correo, telefono } = req.body;

  db.query(
    'UPDATE dellers SET nombre = ?, correo = ?, telefono = ? WHERE id_deller = ?',
    [nombre, correo, telefono, id],
    (err) => {
      if (err) {
        console.error('❌ Error al actualizar deller:', err);
        return res.status(500).json({ error: 'No se pudo actualizar el deller' });
      }

      res.json({ success: true, mensaje: '✅ Deller actualizado' });
    }
  );
};




// 🔹 Eliminar Deller (primero elimina bitácoras)
const eliminarDeller = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM bitacora_vehiculos WHERE id_deller = ?', [id], (err) => {
    if (err) {
      console.error('❌ Error al eliminar bitácoras:', err);
      return res.status(500).json({ error: 'No se pudieron eliminar las bitácoras' });
    }

    db.query('DELETE FROM dellers WHERE id_deller = ?', [id], (err) => {
      if (err) {
        console.error('❌ Error al eliminar deller:', err);
        return res.status(500).json({ error: 'No se pudo eliminar el deller' });
      }

      res.json({ success: true, mensaje: '✅ Deller y bitácoras eliminados' });
    });
  });
};



// 🔹 Eliminar una bitácora individual
const eliminarBitacora = (req, res) => {
  const { id_bitacora } = req.params;

  db.query('DELETE FROM bitacora_vehiculos WHERE id_bitacora = ?', [id_bitacora], (err) => {
    if (err) {
      console.error('❌ Error al eliminar bitácora:', err);
      return res.status(500).json({ error: 'No se pudo eliminar la bitácora' });
    }

    res.json({ success: true, mensaje: '✅ Bitácora eliminada' });
  });
};


// 🔹 Exports
module.exports = {
  obtenerDellers,
  obtenerDellerPorId,
  agregarDeller,
  obtenerDellersPorSucursal,
  agregarBitacora,
  obtenerBitacorasPorDeller,
  actualizarDeller,
  eliminarDeller,
  eliminarBitacora
};
