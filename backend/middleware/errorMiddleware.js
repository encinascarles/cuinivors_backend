const notFound = (req, res, next) => {
  // Create a new error object for when trying to access a non-existent route
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Set status code to 500 if no error code is provided
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";
  // Handle mongoose not found error
  if (err.name === "CastError" && err.kind === "ObjectId") {
    res.status(404);
    message = "Resource not found";
  }
  //Print error if in development or test
  if (
    (process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test") &&
    statusCode === 500
  ) {
    console.log(err);
  }
  // Send error message
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
