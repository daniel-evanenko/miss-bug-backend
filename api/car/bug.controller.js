import { bugService } from "./bug.service.js"
import { loggerService } from "../../services/logger.service.js"


export async function getBugs(req, res) {
    const filterBy = {
        title: req.query.title,
        severity: +req.query.severity,
    }
    try {
        const bugs = await bugService.query(filterBy)
        res.send(bugs)
    } catch (error) {
        loggerService.error(`Couldn't get bugs`, err)
        res.status(400).send(`Couldn't get bugs`)
    }
}

export async function downloadPdf(req, res) {
    try {
        const pdfBytes = await bugService.generatePdfFromData()
        const buffer = Buffer.from(pdfBytes) // Convert Uint8Array to Buffer

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=bugs.pdf')
        res.setHeader('Content-Length', buffer.length)
        res.send(buffer)
    } catch (err) {
        console.error('PDF generation failed:', err)
        res.status(500).send('Error generating PDF')
    }
}

export async function updateBug(req, res) {

    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        severity: req.body.severity,
        description: req.body.description,
        createdAt: req.body.createdAt
    }
    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        loggerService.error(`Couldn't save bug`, err)
        res.status(400).send(`Couldn't save bug`)
    }
}

export async function getBug(req, res) {
    const { bugId } = req.params
    try {
        const bug = await bugService.getById(bugId)

        let visitCount = +req.cookies.visitCount || 0
        visitCount++
        res.cookie('visitCount', visitCount, { maxAge: 1000 * 7 })

        if (visitCount >= 3) return res.status(401).send('Wait for a bit')

        res.send(bug)

    } catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}`, err)
        res.status(400).send(`Couldn't get bug`)
    }
}

export async function removeBug(req, res) {
    const { bugId } = req.params
    try {
        await bugService.remove(bugId)
        res.send('OK')
    } catch (err) {
        loggerService.error(`Couldn't remove bug ${bugId}`, err)
        res.status(400).send(`Couldn't remove bug`)

    }
}

export async function addBug(req, res) {

    const bugToSave = {
        title: req.body.title,
        severity: req.body.severity,
        description: req.body.description,
        createdAt: req.body.createdAt
    }
    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        loggerService.error(`Couldn't add bug`, err)
        res.status(400).send(`Couldn't add bug`)
    }
}