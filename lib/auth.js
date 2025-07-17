import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from './mongodb';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    
    if (user) {
      delete user.password;
    }
    
    return user;
  } catch (error) {
    return null;
  }
};