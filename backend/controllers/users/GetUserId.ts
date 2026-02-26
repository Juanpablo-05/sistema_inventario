import { db } from '../../db/db'
import { Request, Response } from 'express'

export const getUserId = async (req: Request, res: Response) => { 

    const { id } = req.params

    try {
        const user = await db.promise().query('SELECT * FROM usuarios WHERE id = ?', [id])
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json(user[0])
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user', details: error instanceof Error ? error.message : 'Unknown error' })
    }
}