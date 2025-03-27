const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ msg: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //  Aquí guardamos los datos del token para usarlos en controladores
    next(); //  Sigue con la ejecución
  } catch (error) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};
