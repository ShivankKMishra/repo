// api/_utils.mjs

// Standard response format for success
export function successResponse(res, statusCode, data, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta
  });
}

// Standard response format for errors
export function errorResponse(res, statusCode, message, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      details
    }
  });
}