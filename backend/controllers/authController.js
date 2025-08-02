import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // 🔒 Hardcoded login check
  if (email === 'admin' && password === '12345') {
    return res.json({
      id: 1,
      name: 'Admin',
      email: 'admin',
      role: 'admin',
      token: generateToken(1),
    });
  } else {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
};
