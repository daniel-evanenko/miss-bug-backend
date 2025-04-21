import express from 'express'
import { addUser, getUser, getUsers, removeUser, updateUser } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:userId', getUser)
router.put('/:userId', updateUser)
router.post('/', addUser)
router.delete('/:userId', removeUser)

export const userRoutes = router