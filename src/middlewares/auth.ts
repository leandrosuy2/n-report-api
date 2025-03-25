import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = { id: decoded.id };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}; 