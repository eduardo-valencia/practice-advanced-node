jest.setTimeout(30000)
require('../models/User')
const mongoose = require('mongoose')
const keys = require('../config/keys')

// Because it does not want to use the global Promise automatically.
mongoose.Promise = global.Promise
mongoose.connect(keys.mongoURI, { useMongooseClient: true })
