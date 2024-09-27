// module to decrypt jwt token
import jwt from 'jsonwebtoken';

function decrypt(token: string, secret: string) {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, secret);
    return decoded; // Return the decoded payload
  } catch (error) {
    // Handle the error, such as token expiration or invalid signature
    throw new Error('Invalid token'); // You can customize the error message as needed
  }
}

export { decrypt };
