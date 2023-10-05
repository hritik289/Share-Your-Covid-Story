module.exports.EntityNotFound = (message, payload) => {
    return {
        error: true,
        code: 404,
        message,
        payload
    }
}
module.exports.EntityMalformed = (message, payload) => {
    return {
        error: true,
        code: 300,
        message,
        payload
    }
}

module.exports.Forbidded = (message) => {
    return {
        error: true,
        message,
        code: 500
    }
}