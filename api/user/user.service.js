import { makeId, readJsonFile, writeJsonFile } from "../../services/utils.js"

export const userService = {
    query,
    getById,
    remove,
    save,
}

const users = readJsonFile('./data/users.json')

async function query() {
    let bugsToDisplay = users
    try {
        return bugsToDisplay
    } catch (err) {
        throw err
    }
}

async function getById(userId) {
    try {
        const user = users.find(user => user._id === userId)
        if (!user) throw new Error('Cannot find user')
        return user
    } catch (err) {
        throw err
    }
}

async function remove(userId) {
    try {
        const bugIdx = users.findIndex(user => user._id === userId)
        if (bugIdx === -1) throw new Error('Cannot find user')
        users.splice(bugIdx, 1)
        await saveusersToFile()
    } catch (err) {
        console.log('err:', err)
    }
}

async function save(userToSave) {
    try {
        if (userToSave._id) {
            const bugIdx = users.findIndex(user => user._id === userToSave._id)
            if (bugIdx === -1) throw new Error('Cannot find user')
            users[bugIdx] = userToSave
        } else {
            userToSave._id = makeId()
            users.unshift(userToSave)
        }
        await saveusersToFile()
        return userToSave
    } catch (err) {
        throw err
    }
}



function saveusersToFile() {
    return writeJsonFile('./data/users.json', users)
}
