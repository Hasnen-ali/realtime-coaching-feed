export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors.map((error) => error.message).join(', ');
    const validationError = new Error(message);
    validationError.statusCode = 400;
    return next(validationError);
  }

  req.body = result.data;
  return next();
};
