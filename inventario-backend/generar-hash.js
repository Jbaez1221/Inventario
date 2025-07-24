const bcrypt = require('bcryptjs');

// ▼▼▼ CAMBIA ESTA CONTRASEÑA POR LA QUE QUIERAS USAR ▼▼▼
const password = 'CoraSurAdmPass123!'; 

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Tu usuario es: admin');
console.log('Tu hash de contraseña es:');
console.log(hash);