import { loggerService } from "../../services/logger.service.js"
import { msgService } from "./msg.service.js"


export async function getMsgs(req, res) {
    const filterBy = {
        txt: req.query.txt || '',
        aboutBugId: req.query.aboutBugId || '',
        byUserId: req.query.byUserId || '',
    }
    try {
        const msgs = await msgService.query(filterBy)
        res.send(msgs)
    } catch (error) {
        loggerService.error(`Couldn't get msgs`, error)
        res.status(400).send(`Couldn't get msgs`)
    }
}

export async function updateMsg(req, res) {

    const msgToUpdate = {
        _id: req.body._id,
        txt: req.query.txt || '',
        aboutBugId: req.query.aboutBugId || '',
        byUserId: req.query.byUserId || '',
    }
    try {
        const updatedMsg = await msgService.update(msgToUpdate)
        res.send(updatedMsg)
    } catch (err) {
        loggerService.error(`Couldn't update msg`, err)
        res.status(400).send(`Couldn't update msg`)
    }
}

export async function getMsg(req, res) {
    const { msgId } = req.params
    try {
        const msg = await msgService.getById(msgId)

        let visitCount = +req.cookies.visitCount || 0
        visitCount++
        res.cookie('visitCount', visitCount, { maxAge: 1000 * 7 })

        if (visitCount >= 3) return res.status(401).send('Wait for a bit')

        res.send(msg)

    } catch (err) {
        loggerService.error(`Couldn't get msg ${msgId}`, err)
        res.status(400).send(`Couldn't get msg`)
    }
}

export async function removeMsg(req, res) {
    const { msgId } = req.params
    try {
        await msgService.remove(msgId)
        res.send('OK')
    } catch (err) {
        loggerService.error(`Couldn't remove msg ${msgId}`, err)
        res.status(400).send(`Couldn't remove msg`)

    }
}

export async function addMsg(req, res) {
    const { body: msg, loggedinUser } = req

    try {
        msg.byUserId = loggedinUser._id
        const savedMsg = await msgService.add(msg)
        res.send(savedMsg)
    } catch (err) {
        loggerService.error(`Couldn't add msg`, err)
        res.status(400).send(`Couldn't add msg`)
    }
}