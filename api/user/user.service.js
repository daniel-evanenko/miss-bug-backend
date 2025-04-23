import { makeId, readJsonFile, writeJsonFile } from "../../services/utils.js"

export const userService = {
    query,
    getById,
    remove,
    save,
    getByUsername

}

const users = readJsonFile('./data/users.json')

async function query() {
    return users
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
        await _saveUsersToFile()
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
            userToSave.imgUrl = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'
            users.unshift(userToSave)
        }
        await _saveUsersToFile()
        return userToSave
    } catch (err) {
        throw err
    }
}



function _saveUsersToFile() {
    return writeJsonFile('./data/users.json', users)
}

async function getByUsername(username) {
    try {
        const user = users.find(user => user.username === username)
        // if (!user) throw `User not found by username : ${username}`
        return user
    } catch (err) {
        loggerService.error('userService[getByUsername] : ', err)
        throw err
    }
}