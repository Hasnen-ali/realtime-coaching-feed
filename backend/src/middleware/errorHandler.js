export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: statusCode === 500 ? 'Something went wrong' : error.message,
    details: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
};
