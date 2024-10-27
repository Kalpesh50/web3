import { verify } from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
      verify(token, process.env.JWT_SECRET);
      res.status(200).json({ success: true, message: 'Token is valid' });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
