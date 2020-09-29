const ErrorResponse = require("../utils/errorResponse");

const errrorHandler = (err, req, res, next) => {
    let error = err
    console.log(err.message, "ErrorFile");
    //Bad Object
    if (err.name === 'CastError') {
        const message = `Resource not found`
        error = new ErrorResponse(message, 404);
    }
    //Mongoose Duplicate key
    if(err.code === 11000) {
        const message = 'Duplicate field value entered'
        error = new ErrorResponse(message, 400)
        console.log(error.message, "Error");
    }
    //Mongoose Validation failed
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val=> val.message)   
        error = new ErrorResponse(message, 404);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    })
    
}
module.exports = errrorHandler