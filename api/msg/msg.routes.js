import express from 'express'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/log.middleware.js'
import { addMsg, getMsg, getMsgs, removeMsg, updateMsg } from './msg.controller.js'

const router = express.Router()

router.get('/', log, getMsgs)
router.get('/:msgId', log, getMsg)
router.put('/:msgId', log, requireAdmin, updateMsg)
router.post('/', log, requireAuth, addMsg)
router.delete('/:msgId', log, requireAdmin, removeMsg)

export const msgRoutes = router
