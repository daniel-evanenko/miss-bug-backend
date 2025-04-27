import express from 'express'
import { addBug, downloadPdf, getBug, getBugs, removeBug, updateBug } from './bug.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/log.middleware.js'

const router = express.Router()

router.get('/', getBugs)
router.get('/downloadPdf', requireAuth, downloadPdf)
router.get('/:bugId', log, getBug)
router.put('/:bugId', log, requireAuth, updateBug)
router.post('/', log, requireAuth, addBug)
router.delete('/:bugId', log, requireAuth, removeBug)

export const bugRoutes = router