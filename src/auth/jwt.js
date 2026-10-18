import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export class AuthError extends Error { constructor(message='Authentication required',status=401){super(message);this.status=status;} }
export function verifyAccessToken(token){if(!token||typeof token!=='string')throw new AuthError();let claims;try{claims=jwt.verify(token,env.JWT_SECRET,{algorithms:['HS256'],issuer:env.JWT_ISSUER,audience:env.JWT_AUDIENCE});}catch{throw new AuthError('Invalid or expired access token');}const userId=claims?.[env.JWT_USER_ID_CLAIM];if(typeof userId!=='string'&&typeof userId!=='number')throw new AuthError('Token is missing a valid user identifier');return{userId:String(userId),claims};}
export function requireAuth(req,res,next){try{const match=/^Bearer\s+(.+)$/i.exec(req.get('authorization')||'');if(!match)throw new AuthError();req.auth=verifyAccessToken(match[1]);next();}catch(error){next(error);}}
