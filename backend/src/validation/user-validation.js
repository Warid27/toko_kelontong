import jwt from 'jsonwebtoken'

const accessValidation = async (c, next) => {
  const authorization = c.req.header('authorization')

  if (!authorization) {
    return c.json({ message: 'Token diperlukan' }, 401)
  }

  const token = authorization.split(' ')[1]
  const secret = process.env.SECRET_KEY || 'admin123'

  try {
    const jwtDecode = jwt.verify(token, secret)

    if (typeof jwtDecode !== 'string') {
      c.set('userData', jwtDecode) // Store user data in the context
    }
  } catch (error) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
  
  await next()
}

export default accessValidation;