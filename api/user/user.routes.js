import express from 'express'
import { addUser, getUser, getUsers, removeUser, updateUser } from './user.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/log.middleware.js'

const router = express.Router()

router.get('/', log, requireAdmin, getUsers)
router.get('/:userId', log, requireAuth, getUser)
router.put('/:userId', log, requireAdmin, updateUser)
router.post('/', log, addUser)
router.delete('/:userId', log, requireAdmin, removeUser)

export const userRoutes = router