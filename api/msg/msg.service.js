import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

export const msgService = {
    add,
    getById,
    update,
    remove,
    query,
}

const COLLECTION_NAME = 'msg'
async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy);

    try {
        const collection = await dbService.getCollection(COLLECTION_NAME);

        const msgs = await collection.aggregate([
            { $match: criteria },
            {
                $lookup: {
                    from: "bug",
                    localField: "aboutBugId",
                    foreignField: "_id",
                    as: "aboutBug"
                }
            },
            {
                $unwind: { path: "$aboutBug", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "user",
                    localField: "byUserId",
                    foreignField: "_id",
                    as: "byUser"
                }
            },
            {
                $unwind: { path: "$byUser", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    txt: 1,
                    createdAt: { $toDate: "$_id" },
                    "aboutBug._id": 1,
                    "aboutBug.title": 1,
                    "aboutBug.severity": 1,
                    "byUser._id": 1,
                    "byUser.fullname": 1
                }
            }
        ]).toArray();
        return msgs;
    } catch (err) {
        loggerService.error('cannot find msgs', err);
        throw err;
    }
}


async function getById(msgId) {
    try {
        const criteria = { _id: dbService.mongoID(msgId) }

        const collection = await dbService.getCollection(COLLECTION_NAME)
        let msg = await collection.aggregate([
            { $match: criteria },
            {
                $lookup: {
                    from: "bug",
                    localField: "aboutBugId",
                    foreignField: "_id",
                    as: "aboutBug"
                }
            },
            {
                $unwind: { path: "$aboutBug", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "user",
                    localField: "byUserId",
                    foreignField: "_id",
                    as: "byUser"
                }
            },
            {
                $unwind: { path: "$byUser", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    txt: 1,
                    createdAt: { $toDate: "$_id" },
                    "aboutBug._id": 1,
                    "aboutBug.title": 1,
                    "aboutBug.severity": 1,
                    "byUser._id": 1,
                    "byUser.fullname": 1
                }
            }
        ])

        msg = await msg.next()

        if (!msg) {
            throw new Error('msg not found');
        }

        return msg
    } catch (err) {
        loggerService.error(`while finding msg by id: ${msgId}`, err)
        throw err
    }
}

async function remove(msgId) {
    try {
        const criteria = { _id: dbService.mongoID(msgId) }

        const collection = await dbService.getCollection(COLLECTION_NAME)
        await collection.deleteOne(criteria)
    } catch (err) {
        loggerService.error(`cannot remove msg ${msgId}`, err)
        throw err
    }
}

async function update(msg) {
    try {
        // peek only updatable properties
        const msgToSave = {
            _id: dbService.mongoID(msg._id), // needed for the returnd obj
            txt: msg.txt,
            aboutBugId: dbService.mongoID(msg.aboutBugId),
            byUserId: dbService.mongoID(msg.byUserId)
        }
        const collection = await dbService.getCollection(COLLECTION_NAME)
        await collection.updateOne({ _id: msgToSave._id }, { $set: msgToSave })
        return msgToSave
    } catch (err) {
        loggerService.error(`cannot update msg ${msg._id}`, err)
        throw err
    }
}

async function add(msg) {
    try {
        const msgToAdd = {
            txt: msg.txt,
            aboutBugId: dbService.mongoID(msg.aboutBugId),
            byUserId: dbService.mongoID(msg.byUserId)
        }
        const collection = await dbService.getCollection(COLLECTION_NAME)
        await collection.insertOne(msgToAdd)
        return msgToAdd
    } catch (err) {
        loggerService.error('cannot add msg', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};

    if (filterBy.txt) {
        criteria.title = { $regex: filterBy.txt, $options: 'i' };
    }

    if (filterBy.aboutBugId) {
        criteria.aboutBugId = filterBy.aboutBugId;
    }

    if (filterBy.byUserId) {
        criteria.byUserId = filterBy.byUserId;
    }

    return criteria;
}