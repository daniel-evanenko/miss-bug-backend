
import express from 'express'
import { loggerService } from './services/logger.service.js'
import { bugService } from './services/bug.service.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { readJsonFile } from './services/utils.js'
const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173'
    ],
    credentials: true
}

app.use(express.static('public'))
app.use(cors(corsOptions))
app.use(cookieParser())

app.get('/api/bug', async (req, res) => {

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
})

app.get('/api/bug/download-pdf', async (req, res) => {
    try {
      const pdfBytes = await bugService.generatePdfFromData()
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=bugs.pdf')
      res.send(pdfBytes)
    } catch (err) {
      console.error('PDF generation failed:', err)
      res.status(500).send('Error generating PDF')
    }
  })

app.get('/api/bug/save', async (req, res) => {

    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        severity: req.query.severity,
        description: req.query.description,
        createdAt: req.query.createdAt
    }
    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        loggerService.error(`Couldn't save bug`, err)
        res.status(400).send(`Couldn't save bug`)
    }
})

app.get('/api/bug/:bugId', async (req, res) => {
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
})

app.get('/api/bug/:bugId/remove', async (req, res) => {
    const { bugId } = req.params
    try {
        await bugService.remove(bugId)
        res.send('OK')
    } catch (err) {
        loggerService.error(`Couldn't remove bug ${bugId}`, err)
        res.status(400).send(`Couldn't remove bug`)

    }

})




const port = 3030
app.listen(port, () => {
    loggerService.info(`Example app listening on port http://127.0.0.1:${port}/`)
})
