import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export const bugService = {
    query,
    getById,
    remove,
    update,
    generatePdfFromData,
    add
}

async function query(filterBy = { title: '' }) {
    try {
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)
        const collection = await dbService.getCollection('bug')
        const bugsToDisplay = await collection.find(criteria, { sort }).toArray()
        return bugsToDisplay
    } catch (err) {
        throw err
    }
}

async function getById(bugId) {
    try {
        const criteria = { _id: dbService.mongoID(bugId) }
        const collection = await dbService.getCollection('bug')
        const bug = await collection.findOne(criteria)

        bug.createdAt = bug._id.getTimestamp()
        return bug
    } catch (err) {
        loggerService.error(`while finding bug ${bugId}`, err)
        throw err
    }
}

async function remove(bugId, loggedinUser) {
    const { _id: ownerId, isAdmin } = loggedinUser

    try {
        const criteria = {
            _id: dbService.mongoID(bugId),
        }
        if (!isAdmin) criteria['owner.ownerId'] = ownerId;


        const collection = await dbService.getCollection('bug')
        const res = await collection.deleteOne(criteria)

        if (res.deletedCount === 0) throw ('Not your bug')
        return bugId
    } catch (err) {
        loggerService.error(`cannot remove bug ${bugId}`, err)
        throw err
    }
}

async function add(bug) {
    try {
        const collection = await dbService.getCollection('bug')
        await collection.insertOne(bug)
        return bug
    } catch (err) {
        loggerService.error('cannot insert bug', err)
        throw err
    }
}

async function update(bug) {
    const bugToSave = {
        title: bug.title,
        severity: bug.severity,
        description: bug.description,
        createdAt: bug.createdAt,
        labels: bug.labels,
        owner: bug.owner
    }
    try {
        const criteria = { _id: dbService.mongoID(bug._id) }

        const collection = await dbService.getCollection('bug')
        await collection.updateOne(criteria, { $set: bugToSave })

        return bug
    } catch (err) {
        loggerService.error(`cannot update bug ${bug._id}`, err)
        throw err
    }
}

async function generatePdfFromData() {

    const collection = await dbService.getCollection('bug')
    const bugs = await collection.find({}).toArray()

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    let page = pdfDoc.addPage([600, 800])
    let y = 750
    const rowHeight = 20
    const colWidths = [30, 230, 80, 200] // x widths

    const headers = ['#', 'Title', 'Severity', 'Created At']

    // Title
    page.drawText('Bug Report Table', {
        x: 50,
        y,
        size: 18,
        font,
        color: rgb(0, 0, 0),
    })
    y -= 30

    // Draw header row
    headers.forEach((header, i) => {
        page.drawText(header, {
            x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            size: 12,
            font,
            color: rgb(0, 0, 0),
        })
    })
    y -= rowHeight

    // Draw data rows
    bugs.forEach((bug, index) => {
        const createdAt = new Date(+bug.createdAt).toLocaleString()
        const row = [
            `${index + 1}`,
            bug.title || 'N/A',
            String(bug.severity),
            createdAt,
        ]

        if (y < 40) {
            page = pdfDoc.addPage([600, 800])
            y = 750
        }

        row.forEach((cell, i) => {
            page.drawText(cell, {
                x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
                y,
                size: 10,
                font,
                color: rgb(0.2, 0.2, 0.2),
            })
        })
        y -= rowHeight
    })

    return await pdfDoc.save()
}

function _buildCriteria(filterBy) {
    const criteria = {};

    if (filterBy.title) {
        criteria.title = { $regex: filterBy.title, $options: 'i' };
    }

    if (filterBy.severity != null) {
        criteria.severity = { $gte: +filterBy.severity };
    }

    if (Array.isArray(filterBy.byLabels) && filterBy.byLabels.length > 0) {
        criteria.labels = { $all: filterBy.byLabels };
    }

    if (filterBy.ownerId) {
        criteria['owner.ownerId'] = filterBy.ownerId;
    }

    return criteria;
}

function _buildSort(filterBy) {
    if (!filterBy.sortBy || !filterBy.sortDir) return {};
    return { [filterBy.sortBy]: filterBy.sortDir };
}