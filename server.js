import 'dotenv/config'
import express from 'express'
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'
import auth from './middlewares/auth.js'

const app = express()
app.use(express.json())

app.use('/', publicRoutes)
app.use('/private', auth, privateRoutes)

app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({
            message: 'JSON inválido no body da requisição.'
        })
    }

    return next(err)
})

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000")
})