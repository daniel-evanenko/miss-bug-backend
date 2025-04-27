import { loggerService } from "../../services/logger.service.js"
import { makeId, readJsonFile, writeJsonFile } from "../../services/utils.js"
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export const bugService = {
    query,
    getById,
    remove,
    save,
    generatePdfFromData
}

const bugs = readJsonFile('./data/bugs.json')

async function query(filterBy) {
    let bugsToDisplay = bugs
    try {
        if (filterBy.title) {
            const regExp = new RegExp(filterBy.title, 'i')
            bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title))
        }

        if (filterBy.severity) {
            bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.severity)
        }
        if (Array.isArray(filterBy.byLabels) && filterBy.byLabels.length > 0) {
            bugsToDisplay = bugsToDisplay.filter(bug =>
                Array.isArray(bug.labels) && filterBy.byLabels.every(label => bug.labels.includes(label))
            );
        }
        if (filterBy.ownerId) {
            bugsToDisplay = bugsToDisplay.filter(bug => bug.owner._id === filterBy.ownerId);
        }
        return bugsToDisplay
    } catch (err) {
        throw err
    }
}

async function getById(bugId) {
    try {
        const bug = bugs.find(bug => bug._id === bugId)
        if (!bug) throw new Error('Cannot find bug')
        return bug
    } catch (err) {
        throw err
    }
}

async function remove(bugId, loggedinUser) {
    try {
        const bugIdx = bugs.findIndex(bug => bug._id === bugId)
        if (bugIdx === -1) throw `Couldn't find bug with _id ${bugId}`
        const bug = bugs[bugIdx]
        if (!loggedinUser?.isAdmin &&
            bug.owner._id !== loggedinUser._id) {
            throw 'Not your bug'
        }
        bugs.splice(bugIdx, 1)
        await _savebugsToFile()
    } catch (err) {
        loggerService.error('bugService[remove] : ', err)
        throw err
    }
}

async function save(bugToSave) {
    try {
        if (bugToSave._id) {
            const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
            if (bugIdx === -1) throw new Error('Cannot find bug')
            bugs[bugIdx] = bugToSave
        } else {
            bugToSave._id = makeId()
            bugs.unshift(bugToSave)
        }
        await _savebugsToFile()
        return bugToSave
    } catch (err) {
        throw err
    }
}


async function generatePdfFromData() {

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

function _savebugsToFile() {
    return writeJsonFile('./data/bugs.json', bugs)
}
