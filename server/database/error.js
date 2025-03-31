const Error = require("../models/Error")

async function createError(error) {
  try {
    console.log(error.message)
    const newError = await Error.create({
      message: error.message,
      errorStack: error.stack,
    })
    console.log(newError)
  } catch (error) {
    console.error(error)
  }
}

function fetchErrors() {
  try {
    const errors = Error.find()
    return errors
  } catch (error) {
    createError(error)
  }
}

module.exports = {
  createError,
  fetchErrors,
}
