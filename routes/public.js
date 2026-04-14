import express from 'express'
import bcrypt from 'bcrypt'
import { PrismaClient } from '../generated/prisma/client.ts'
import jwt from 'jsonwebtoken'

const router = express.Router()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET 


// cadastro
router.post('/cadastro', async (req, res) => {
    try {
        const { nome, name, email, password } = req.body
        const userName = name ?? nome

        if (!userName || !email || !password) {
            return res.status(400).json({
                message: "Campos obrigatórios: nome (ou name), email e password."
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const userDB = await prisma.user.create({
            data: {
                email,
                name: userName,
                password: hashPassword,
            }
        })

        res.status(201).json({
            message: "Usuário criado com sucesso!",
            user: {
                id: userDB.id,
                name: userDB.name,
                email: userDB.email
            }
        })

    } catch (error) {
        console.error('Erro /cadastro:', error)
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
        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '1m'})


        res.status(200).json({ message: "Login realizado com sucesso!", user, token})
    } catch(error) {
        res.status(500).json({ message: "Erro no servidor, tente novamente mais tarde." })
    }
})


export default router