import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

export const userService = {
    add,
    getById,
    update, 
    remove,
    query, 
    getByUsername, 
}

const COLLECTION_NAME = 'user'
async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)

        const users = await collection.aggregate([
            { $match: criteria },
            {
                $lookup: {
                    from: "bug",
                    localField: "_id",
                    foreignField: "owner.ownerId",
                    as: "bugs"
                }
            },
            {
                $project: {
                    password: 0
                }
            }
        ]).toArray()

        users.forEach(user => {
            user.createdAt = user._id.getTimestamp()
        })
        return users
    } catch (err) {
        loggerService.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const criteria = { _id: dbService.mongoID(userId) }

        const collection = await dbService.getCollection(COLLECTION_NAME)
        let user = await collection.aggregate([
            { $match: criteria },
            {
                $lookup: {
                    from: "bug",
                    localField: "_id",
                    foreignField: "owner.ownerId",
                    as: "bugs"
                }
            },
            {
                $project: {
                    password: 0
                }
            }
        ])

        user = await user.next()

        if (!user) {
            throw new Error('User not found');
        }

        user.createdAt = user._id.getTimestamp();

        return user
    } catch (err) {
        loggerService.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection(COLLECTION_NAME)
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        loggerService.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const bugCollection = await dbService.getCollection('bug')
        const msgCollection = await dbService.getCollection('msg')

        const userObjectId = dbService.mongoID(userId)

        const ownedBugsCount = await bugCollection.countDocuments({ 'owner.ownerId': userObjectId })
        const ownedMessagesCount = await msgCollection.countDocuments({ byUserId: userObjectId })
        if (ownedBugsCount > 0 || ownedMessagesCount > 0) {
            const errorMessage = `Cannot delete user ${userId} as they own ${ownedBugsCount} bugs and ${ownedMessagesCount} messages.`
            loggerService.warn(errorMessage)
            throw new Error(errorMessage)
        }

        const userCollection = await dbService.getCollection('user')
        const res = await userCollection.deleteOne({ _id: userObjectId })

        if (res.deletedCount === 0) {
            loggerService.warn(`User ${userId} not found for deletion.`)
            throw new Error(`User ${userId} not found.`)
        }

        loggerService.info(`User ${userId} deleted successfully.`)
        return userId
    } catch (err) {
        loggerService.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties
        const userToSave = {
            _id: dbService.mongoID(user._id), // needed for the returnd obj
            fullname: user.fullname,
            fullname: user.username,
            fullname: user.description,
            score: user.score,
        }
        const collection = await dbService.getCollection(COLLECTION_NAME)
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        loggerService.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl,
            isAdmin: user.isAdmin,
            score: user.score,
        }
        const collection = await dbService.getCollection(COLLECTION_NAME)
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        loggerService.error('cannot add user', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
        ]
    }
    if (filterBy.minBalance) {
        criteria.score = { $gte: filterBy.minBalance }
    }
    return criteria
}