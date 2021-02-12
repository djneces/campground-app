//takes in a func, what executes a func that returns another func
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}