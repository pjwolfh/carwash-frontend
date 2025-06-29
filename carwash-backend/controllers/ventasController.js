const db = require('../db/connection');

// 🔹 Registrar venta directamente (manual o escaneada)
const registrarVenta = (req, res) => {
  console.log('📥 Datos recibidos para registrar venta:', req.body);

  const { id_cliente, servicio_id, id_sucursal, id_usuario } = req.body;

  if (!id_cliente || !servicio_id || !id_sucursal || !id_usuario) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  db.query('SELECT precio, puntos FROM servicios WHERE id = ?', [servicio_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: 'Error al obtener servicio' });
    }

    const { precio, puntos } = results[0];

    // 👇 Insertar venta con el cliente como consumidor y registrar quién la ingresó
    const insertQuery = `
      INSERT INTO ventas (id_usuario, servicio_id, monto_total, estado_confirmacion, id_sucursal, id_confirmador)
      VALUES (?, ?, ?, 'confirmada', ?, ?)
    `;

    db.query(insertQuery, [id_cliente, servicio_id, precio, id_sucursal, id_usuario], (err2) => {
      if (err2) {
        console.error('❌ Error al registrar venta:', err2);
        return res.status(500).json({ error: 'Error al registrar la venta' });
      }

      const updateUser = `
        UPDATE usuarios
        SET puntos = puntos + ?, servicios_acumulados = servicios_acumulados + 1
        WHERE id = ?
      `;

      console.log('🎯 Sumando', puntos, 'puntos al CLIENTE ID:', id_cliente);
      console.log('🧪 Ejecutando query:', updateUser);
      console.log('🧪 Con valores:', [puntos, id_cliente]);

      db.query(updateUser, [puntos, id_cliente], (err3) => {
        if (err3) {
          console.error('❌ Venta registrada, pero error al actualizar puntos:', err3);
          return res.status(500).json({ error: 'Venta registrada, pero no se actualizaron los puntos del cliente' });
        }

        res.json({ success: true, mensaje: '🎉 Venta registrada y puntos asignados al cliente correctamente' });
      });
    });
  });
};



// 🔹 Solicitud de venta pendiente
// 🔹 Solicitud de venta pendiente
const solicitarVenta = (req, res) => {
  const { id_cliente, servicio_id, id_sucursal } = req.body;

  if (!id_cliente || !servicio_id || !id_sucursal) {
    return res.status(400).json({ error: 'Faltan datos del cliente, servicio o sucursal' });
  }

  db.query('SELECT precio FROM servicios WHERE id = ?', [servicio_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: 'No se encontró el servicio' });
    }

    const { precio } = results[0];

    const sql = `
      INSERT INTO ventas (id_usuario, servicio_id, monto_total, estado_confirmacion, id_sucursal)
      VALUES (?, ?, ?, 'pendiente', ?)
    `;

    db.query(sql, [id_cliente, servicio_id, precio, id_sucursal], (err2) => {
      if (err2) {
        console.error('❌ Error al registrar solicitud de venta:', err2);
        return res.status(500).json({ error: 'Error al guardar la solicitud' });
      }

      res.json({ success: true, mensaje: '✅ Solicitud enviada. Pendiente de confirmación.' });
    });
  });
};


// 🔔 Contar ventas pendientes por sucursal
const contarVentasPendientes = (req, res) => {
  const { id_sucursal } = req.params;

  if (!id_sucursal) {
    return res.status(400).json({ error: 'ID de sucursal requerido' });
  }

  const sql = `
    SELECT COUNT(*) AS pendientes
    FROM ventas
    WHERE id_sucursal = ? AND estado_confirmacion = 'pendiente'
  `;

  db.query(sql, [id_sucursal], (err, results) => {
    if (err) {
      console.error('❌ Error al contar ventas pendientes:', err);
      return res.status(500).json({ error: 'Error al contar ventas pendientes' });
    }

    res.json({ pendientes: results[0].pendientes });
  });
};


// 🔹 Confirmar venta (desde panel admin)
const confirmarVenta = (req, res) => {
  const { venta_id, id_usuario, id_sucursal } = req.body;

  if (!venta_id || !id_usuario || !id_sucursal) {
    return res.status(400).json({ error: 'Faltan datos para confirmar' });
  }

  // 1️⃣ Marcar la venta como confirmada y registrar quién la confirmó
  const updateVenta = `
    UPDATE ventas
    SET estado_confirmacion = 'confirmada',
        id_confirmador = ?, 
        id_sucursal = ?
    WHERE id = ?
  `;

  db.query(updateVenta, [id_usuario, id_sucursal, venta_id], (err1) => {
    if (err1) {
      console.error('❌ Error al confirmar venta:', err1);
      return res.status(500).json({ error: 'No se pudo confirmar la venta' });
    }

    // 2️⃣ Obtener datos de la venta: id_usuario (cliente) y servicio_id
    const queryVenta = `SELECT id_usuario, servicio_id FROM ventas WHERE id = ?`;

    db.query(queryVenta, [venta_id], (err2, results) => {
      if (err2 || results.length === 0) {
        console.error('❌ No se pudo obtener datos de la venta:', err2);
        return res.status(500).json({ error: 'Venta confirmada, pero no se encontraron datos del cliente' });
      }

      // ✅ Asegúrate que aquí la columna sea "id_usuario" si así está en tu tabla de ventas
      const id_cliente = results[0].id_usuario;
      const servicio_id = results[0].servicio_id;

      if (!id_cliente || !servicio_id) {
        console.error('⚠️ Datos incompletos en resultados de venta:', results[0]);
        return res.status(500).json({ error: 'Faltan datos de cliente o servicio' });
      }

      // 3️⃣ Obtener puntos del servicio
      db.query('SELECT puntos FROM servicios WHERE id = ?', [servicio_id], (err3, serv) => {
        if (err3 || serv.length === 0) {
          console.error('❌ No se encontraron puntos del servicio:', err3);
          return res.status(500).json({ error: 'Venta confirmada, pero no se encontraron puntos del servicio' });
        }

        const puntos = serv[0].puntos;

        // 4️⃣ Sumar puntos al cliente
        const updateUser = `
          UPDATE usuarios
          SET puntos = puntos + ?, servicios_acumulados = servicios_acumulados + 1
          WHERE id = ?
        `;

        db.query(updateUser, [puntos, id_cliente], (err4) => {
          if (err4) {
            console.error('❌ Error al sumar puntos al cliente:', err4);
            return res.status(500).json({ error: 'Venta confirmada, pero no se sumaron los puntos' });
          }

          console.log(`✅ Confirmación completa: Cliente ${id_cliente} sumó ${puntos} puntos`);
          res.json({ success: true, mensaje: '✅ Venta confirmada y puntos asignados correctamente' });
        });
      });
    });
  });
};



// 🔹 Declinar venta
const declinarVenta = (req, res) => {
  const { id_venta } = req.body;

  if (!id_venta) {
    return res.status(400).json({ error: 'ID de venta requerido' });
  }

  const update = `
    UPDATE ventas
    SET estado_confirmacion = 'declinada'
    WHERE id = ?
  `;

  db.query(update, [id_venta], (err) => {
    if (err) {
      console.error('❌ Error al declinar venta:', err);
      return res.status(500).json({ error: 'No se pudo declinar la venta' });
    }

    res.json({ success: true, mensaje: '⚠️ Solicitud de venta declinada' });
  });
};

// 🔹 Obtener historial de ventas
const obtenerHistorialVentas = (req, res) => {
  const { id_sucursal, fechaDesde, fechaHasta } = req.body;

  if (!id_sucursal) {
    return res.status(400).json({ error: 'ID de sucursal requerido' });
  }

  let filtros = ` WHERE v.id_sucursal = ? `;
  const params = [id_sucursal];

  if (fechaDesde && fechaHasta) {
    filtros += ' AND DATE(v.fecha_hora) BETWEEN ? AND ? ';
    params.push(fechaDesde, fechaHasta);
  }

  const sql = `
    SELECT 
      v.id,
      v.fecha_hora,
      e.nombre_empleado AS nombre_empleado,
      su.nombre_sucursal AS nombre_sucursal,
      u.id AS id_cliente,
      u.email AS email_cliente,
      u.servicios_acumulados,
      s.nombre_servicio AS nombre_servicio,
      s.puntos,
      v.monto_total,
      v.estado_confirmacion
    FROM ventas v
    LEFT JOIN empleados e ON v.id_empleado = e.id_empleado
    LEFT JOIN usuarios u ON v.id_usuario = u.id
    LEFT JOIN servicios s ON v.servicio_id = s.id
    LEFT JOIN sucursales su ON v.id_sucursal = su.id_sucursal
    ${filtros}
    ORDER BY v.fecha_hora DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener historial de ventas:', err);
      return res.status(500).json({ error: 'Error al obtener historial de ventas' });
    }
    res.json(results);
  });
};


// 🔔 Obtener cantidad de ventas pendientes por sucursal
const obtenerVentasPendientes = (req, res) => {
  const { id_sucursal } = req.params;

  if (!id_sucursal) {
    return res.status(400).json({ error: 'ID de sucursal requerido' });
  }

  const sql = `SELECT COUNT(*) AS pendientes FROM ventas WHERE id_sucursal = ? AND estado_confirmacion = 'pendiente'`;

  db.query(sql, [id_sucursal], (err, results) => {
    if (err) {
      console.error('❌ Error al contar pendientes:', err);
      return res.status(500).json({ error: 'Error al contar ventas pendientes' });
    }

    res.json({ pendientes: results[0].pendientes });
  });
};


const obtenerPendientes = (req, res) => {
  const { idSucursal } = req.params;
  const sql = `
    SELECT COUNT(*) AS pendientes
    FROM ventas
    WHERE id_sucursal = ? AND estado_confirmacion = 'pendiente'
  `;

  db.query(sql, [idSucursal], (err, results) => {
    if (err) {
      console.error('❌ Error al contar pendientes:', err);
      return res.status(500).json({ error: 'Error al consultar ventas pendientes' });
    }

    const total = results[0]?.pendientes || 0;
    res.json({ pendientes: total });
  });
};


// 🔹 Obtener resumen de ventas (día, semana, mes + empleados activos)
const obtenerResumenSucursal = (req, res) => {
  const { id_sucursal } = req.params;

  if (!id_sucursal) {
    return res.status(400).json({ error: 'ID de sucursal requerido' });
  }

  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // domingo
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const sql = `
    SELECT
      SUM(CASE WHEN DATE(fecha_hora) = CURDATE() THEN monto_total ELSE 0 END) AS ventas_dia,
      SUM(CASE WHEN fecha_hora >= ? THEN monto_total ELSE 0 END) AS ventas_semana,
      SUM(CASE WHEN fecha_hora >= ? THEN monto_total ELSE 0 END) AS ventas_mes
    FROM ventas
    WHERE id_sucursal = ? AND estado_confirmacion = 'confirmada'
  `;

  db.query(sql, [inicioSemana, inicioMes, id_sucursal], (err, resultados) => {
    if (err) {
      console.error('❌ Error en resumen:', err);
      return res.status(500).json({ error: 'Error al obtener resumen de ventas' });
    }

    const resumen = resultados[0] || { ventas_dia: 0, ventas_semana: 0, ventas_mes: 0 };

    db.query(
      `SELECT COUNT(*) AS empleados_activos FROM empleados WHERE id_sucursal = ? AND estado = 'activo'`,
      [id_sucursal],
      (err2, emp) => {
        if (err2) {
          console.error('❌ Error empleados activos:', err2);
          return res.status(500).json({ error: 'Error al contar empleados activos' });
        }

        resumen.empleados_activos = emp[0].empleados_activos || 0;
        res.json(resumen);
      }
    );
  });
};

module.exports = {
  // otros...
  obtenerResumenSucursal,
  registrarVenta,
  solicitarVenta,
  confirmarVenta,
  declinarVenta,
  obtenerHistorialVentas,
  contarVentasPendientes,
  obtenerVentasPendientes,
  obtenerPendientes,
};
