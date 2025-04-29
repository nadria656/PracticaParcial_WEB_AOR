const errorHandler = (err, req, res, next) => {
    console.error('[Global ErrorHandler]', err);
  
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      msg: err.message || 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorHandler;
  