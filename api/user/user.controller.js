import { userService } from "../user/user.service.js"
import { loggerService } from "../../services/logger.service.js"


export async function getUsers(req, res) {
    try {
        const users = await userService.query()
        res.send(users)
    } catch (error) {
        loggerService.error(`Couldn't get users`, error)
        res.status(400).send(`Couldn't get users`)
    }
}

export async function updateUser(req, res) {

    const userToSave = {
        _id: req.body._id,
        fullname: req.body.fullname,
        username: req.body.username,
        password: req.body.password,
        score: req.body.score
    }
    try {
        const savedUser = await userService.save(userToSave)
        res.send(savedUser)
    } catch (err) {
        loggerService.error(`Couldn't save user`, err)
        res.status(400).send(`Couldn't save user`)
    }
}

export async function getUser(req, res) {
    const { userId } = req.params
    try {
        const user = await userService.getById(userId)

        let visitCount = +req.cookies.visitCount || 0
        visitCount++
        res.cookie('visitCount', visitCount, { maxAge: 1000 * 7 })

        if (visitCount >= 3) return res.status(401).send('Wait for a bit')

        res.send(user)

    } catch (err) {
        loggerService.error(`Couldn't get user ${userId}`, err)
        res.status(400).send(`Couldn't get user`)
    }
}

export async function removeUser(req, res) {
    const { userId } = req.params
    try {
        await userService.remove(userId)
        res.send('OK')
    } catch (err) {
        loggerService.error(`Couldn't remove user ${userId}`, err)
        res.status(400).send(`Couldn't remove user`)

    }
}

export async function addUser(req, res) {

    const userToSave = {
        fullname: req.body.fullname,
        username: req.body.username,
        password: req.body.password,
        score: req.body.score
    }
    try {
        const saveduser = await userService.save(userToSave)
        res.send(saveduser)
    } catch (err) {
        loggerService.error(`Couldn't add user`, err)
        res.status(400).send(`Couldn't add user`)
    }
}