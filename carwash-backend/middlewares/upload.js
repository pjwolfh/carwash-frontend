const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📁 Crear carpeta 'uploads' si no existe
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadPath, { recursive: true }); // crea la carpeta si no existe

// ⚙️ Configurar destino y nombre del archivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // destino final
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// 🚀 Middleware listo para exportar
const upload = multer({ storage });

module.exports = upload;
