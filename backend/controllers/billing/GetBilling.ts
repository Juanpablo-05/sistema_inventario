import { db } from '../../db/db';
import { Request, Response } from 'express';

export const getBilling = async (req: Request, res: Response) => { 
    try {
        const [rows] = await db.promise().query('SELECT * FROM facturas');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las facturas' });
    }
}