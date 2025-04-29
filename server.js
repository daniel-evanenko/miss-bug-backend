import express from 'express'
import { loggerService } from './services/logger.service.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { bugRoutes } from './api/bug/bug.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { msgRoutes } from './api/msg/msg.routes.js'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

app.use(cookieParser())
app.use(express.json())

app.use('/api/user', userRoutes)
app.use('/api/bug', bugRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/msg', msgRoutes)


app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const port = 3030
app.listen(port, () => {
    loggerService.info(`Example app listening on port http://127.0.0.1:${port}/`)
})
