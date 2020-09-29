const logger = (req, res, next) => {
    console.log(`${req.method}`);
}

module.exports = logger