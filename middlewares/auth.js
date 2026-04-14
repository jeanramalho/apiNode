import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

const auth = (req, res, next) => {
    const token = req.headers.authorization

    if(!token) {
        return res.status(401).json({message: 'Acesso negado, token inválido ou não fornecido.'}) 
    }

    try {

        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET)
        req.userId = decoded.userId

    } catch(error) {
       return res.status(400).json({message: 'Token inválido.', error})
    }

    next()

}


export default auth