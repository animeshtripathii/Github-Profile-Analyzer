
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  
  if (statusCode >= 500) {
    console.error('Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;
