const mongoose = require('mongoose')
const redis = require('redis')
const { promisify } = require('util')

const redisUrl = 'redis://127.0.1:6379'
const client = redis.createClient(redisUrl)
const get = promisify(client.hget).bind(client)
const { exec } = mongoose.Query.prototype

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true
  const { key = '' } = options
  this.hashKey = JSON.stringify(key)
  // To make it chainable
  return this
}

mongoose.Query.prototype.exec = async function() {
  // Assigns the results of get query.
  if (this.useCache) {
    const stringKey = getKey(this.getQuery(), this.name)
    const cacheValue = await get(this.hashKey, stringKey)
    if (cacheValue) {
      // Might be a list of docs or one doc.
      getDocsFromCache.bind(this)
      return getDocsFromCache(cacheValue)
    }
    const result = await exec.apply(this, arguments)
    setResult(this.hashKey, result, stringKey)
    return result
  }
  return exec.apply(this, arguments)
}

const getDocsFromCache = cacheValue => {
  const jsonValue = JSON.parse(cacheValue)
  if (Array.isArray(jsonValue)) {
    createAndGetDocs.bind(this)
    return createAndGetDocs(jsonValue)
  }
  return new this.model(jsonValue)
}

const createAndGetDocs = jsonValue => {
  return jsonValue.map(document => new this.model(document))
}

function setResult(hashKey, result, stringKey) {
  const jsonResult = JSON.stringify(result)
  client.hset(hashKey, stringKey, jsonResult)
}

function getKey(query, collectionName) {
  const queryWithCollection = Object.assign({}, query, {
    collection: collectionName
  })
  const stringKey = JSON.stringify(queryWithCollection)
  return stringKey
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}
