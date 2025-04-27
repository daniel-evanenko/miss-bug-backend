import express from 'express'
import { addUser, getUser, getUsers, removeUser, updateUser } from './user.controller.js'
import { requireAdmin } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

router.get('/', requireAdmin, getUsers)
router.get('/:userId', requireAdmin, getUser)
router.put('/:userId', requireAdmin, updateUser)
router.post('/', addUser)
router.delete('/:userId', requireAdmin, removeUser)

export const userRoutes = router