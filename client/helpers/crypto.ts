// module to decrypt jwt token
import { jwtVerify } from 'jose';

async function decrypt(token: string, secret: string) {
  try {
    // Convert the secret to a Uint8Array
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload; 
  } catch (error) {
    console.log(error);
    // Handle the error, such as token expiration or invalid signature
    throw new Error('Invalid token'); // You can customize the error message as needed
  }
}

export { decrypt };
