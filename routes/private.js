import express from 'express'
import { PrismaClient } from '../generated/prisma/client.ts'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/list', async (req, res) => {
    try {

        const users = await prisma.user.findMany()

        res.status(200).json({ message: "Usuários listados com sucesso!", users})
        
    } catch(error) {
        res.status(500).json({ message: "Erro ao listar usuários, tente novamente mais tarde.", error})
    }
})

export default router