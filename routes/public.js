import express from 'express'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prismaa/client'
import jwt from 'jsonwebtoken'

const router = express.Router()
const prisma = new PrismaClient()


// cadastro
router.post('/cadastro', async (req, res) => {
    try {
        const user = req.body

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(user.password, salt)

        const userDB = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                password: hashPassword,
            }
        })

        res.status(201).json({ message: "Usuário criado com sucesso!", user })

    } catch (error) {
        res.status(500).json({ message: "Erro no servidor, tente novamente mais tarde." })
    }

})

// Login
router.post('/login', async (req, res) => {
    try {

        const userInfo = req.body
        
        // Busca usuário no banco de dados
        const user = await prisma.user.findUnique({
            where: {email: userInfo.email}
        }) 

        // Verifica se o usuário existe no banco de dados
        if(!user) {
            return res.status(404).json({ message: "Usuário não encontrado."})
        }

        // Compara a senha do banco de dados com a senha digitada pelo usuário
        const isMatch = await bcrypt.compare(userInfo.password, user.password)

        if(!isMatch) {
            return res.status(400).json({message: "Senha incorreta."})
        }

        // Gera o token JWT


    } catch(error) {
        res.status(500).json({ message: "Erro no servidor, tente novamente mais tarde." })
    }
})


export default router