const STATUS_CODES = {
  internal_server_error: 500,
  not_found: 404,
  success: 200,
  validation_error: 400,
};

function response(res, data, message, statusCode) {
  return res.status(statusCode).send(data);
}

export function successResponse(res, data, message = "Successs") {
  return response(res, data, message, STATUS_CODES.success);
}

export function validationError(res, data, message = "Validation Error") {
  return response(res, data, message, STATUS_CODES.validation_error);
}

export function notFoundError(res) {
  return response(res, {}, "Not found", STATUS_CODES.not_found);
}

export function internalServerError(res) {
  return response(
    res,
    {},
    "Opps, an unknown error has occured",
    STATUS_CODES.internal_server_error
  );
}
