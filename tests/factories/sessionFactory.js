require('../setup')
const { Buffer } = require('safe-buffer')
const Keygrip = require('keygrip')
const keys = require('../../config/keys')

function getSessionInfo(user) {
  // Because the _id is an object.
  const sessionString = getSessionStr(user)
  const signature = getSignature(sessionString)
  return { sessionString, signature }
}

module.exports = getSessionInfo

function getSessionStr(user) {
  const sessionObject = { passport: { user: user._id.toString() } }
  const sessionDataStr = JSON.stringify(sessionObject)
  const sessionString = Buffer.from(sessionDataStr).toString('base64')
  return sessionString
}

function getSignature(sessionString) {
  const keygrip = new Keygrip([keys.cookieKey])
  const signature = keygrip.sign(`session=${sessionString}`)
  return signature
}
