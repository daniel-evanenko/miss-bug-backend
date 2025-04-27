import { bugService } from "./bug.service.js"
import { loggerService } from "../../services/logger.service.js"


export async function getBugs(req, res) {
    const filterBy = {
        title: req.query.title,
        severity: +req.query.severity,
        sortBy: req.query.sortBy,
        byLabels: req.query.byLabels,
        ownerId: req.query.ownerId
    }
    try {
        const bugs = await bugService.query(filterBy)
        res.send(bugs)
    } catch (error) {
        loggerService.error(`Couldn't get bugs`, error)
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
        let visitedBugIds = req.cookies.visitedBugIds || []
        if (!visitedBugIds.includes(bugId)) visitedBugIds.push(bugId)
        if (visitedBugIds.length > 3) return res.status(403).send('Wait for a bit')

        const bug = await bugService.getById(bugId)
        res.cookie('visitedBugIds', visitedBugIds, { maxAge: 1000 * 8 })

        res.send(bug)

    } catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}`, err)
        res.status(400).send(`Couldn't get bug`)
    }
}

export async function removeBug(req, res) {
    const { bugId } = req.params
    try {
        await bugService.remove(bugId,req.loggedinUser)
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
        createdAt: req.body.createdAt,
        owner: req.body.owner
    }
    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        loggerService.error(`Couldn't add bug`, err)
        res.status(400).send(`Couldn't add bug`)
    }
}