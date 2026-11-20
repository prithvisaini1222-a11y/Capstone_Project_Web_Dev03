exports.notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404; next(err);
};
exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";
  if (err.name === "ValidationError") { status = 400; message = Object.values(err.errors).map(e => e.message).join(", "); }
  if (err.code === 11000) { status = 409; message = "A record with this value already exists"; }
  if (err.name === "CastError") { status = 400; message = "Invalid resource ID"; }
  if (process.env.NODE_ENV !== "production") console.error(err);
  res.status(status).json({ success: false, message });
};
