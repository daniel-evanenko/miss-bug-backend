import { MongoClient, ObjectId } from 'mongodb'
import { loggerService } from './logger.service.js'

import { config } from '../config/index.js'



const mongoID = ObjectId.createFromHexString
export const dbService = { getCollection, mongoID }

var dbConn = null

async function getCollection(collectionName) {
	try {
		const db = await _connect()
		const collection = await db.collection(collectionName)
		return collection
	} catch (err) {
		loggerService.error('Failed to get Mongo collection', err)
		throw err
	}
}

async function _connect() {
	if (dbConn) return dbConn
    
	try {
		const client = await MongoClient.connect(config.dbURL)
		return dbConn = client.db(config.dbName)
	} catch (err) {
		loggerService.error('Cannot Connect to DB', err)
		throw err
	}
}