import express from 'express'   

const router = express.Router()


// cadastro
router.post('/cadastro', (req, res) => {

    const user = req.body

    res.status(201).json(user)
})

// Configurações MongoDB
// jeanramalho
// #Raikinha2012
// mongodb+srv://jeanramalho:#Raikinha2012@users.qtxo2qq.mongodb.net/?appName=Users

export default router