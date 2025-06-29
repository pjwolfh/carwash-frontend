function generarID() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';
    for (let i = 0; i < 6; i++) {
      const aleatorio = Math.floor(Math.random() * caracteres.length);
      resultado += caracteres[aleatorio];
    }
    return resultado;
  }
  
  module.exports = { generarID };
  