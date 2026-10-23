import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
 NODE_ENV:z.enum(['development','test','production']).default('development'), PORT:z.coerce.number().int().min(1).max(65535).default(8081), HOST:z.string().default('0.0.0.0'), PUBLIC_BASE_URL:z.string().url(), CORS_ORIGINS:z.string().default(''),
 JWT_SECRET:z.string().min(32), JWT_ISSUER:z.string().default('cloudcomai'), JWT_AUDIENCE:z.string().default('cloudcomai-calling'), JWT_USER_ID_CLAIM:z.string().default('sub'),
 MYSQL_HOST:z.string().default('127.0.0.1'), MYSQL_PORT:z.coerce.number().int().min(1).max(65535).default(3306), MYSQL_DATABASE:z.string().default('cloudcomai_calls'), MYSQL_USER:z.string().default('calling_service'), MYSQL_PASSWORD:z.string().min(1), MYSQL_CONNECTION_LIMIT:z.coerce.number().int().min(1).max(50).default(5),
 MEDIASOUP_LISTEN_IP:z.string().default('0.0.0.0'), MEDIASOUP_ANNOUNCED_IP:z.string().min(1), MEDIASOUP_MIN_PORT:z.coerce.number().int().min(1024).max(65535).default(40000), MEDIASOUP_MAX_PORT:z.coerce.number().int().min(1024).max(65535).default(49999), MEDIASOUP_NUM_WORKERS:z.coerce.number().int().min(1).max(16).default(1),
 TURN_HOST:z.string().min(1), TURN_UDP_PORT:z.coerce.number().int().min(1).max(65535).default(3478), TURN_TLS_PORT:z.coerce.number().int().min(1).max(65535).default(5349), TURN_TLS_ENABLED:z.enum(['true','false']).default('false').transform(v=>v==='true'), TURN_SECRET:z.string().min(32), TURN_REALM:z.string().min(1),
 CALL_RING_TIMEOUT_SECONDS:z.coerce.number().int().min(10).max(120).default(45), CALL_RECONNECT_GRACE_SECONDS:z.coerce.number().int().min(5).max(120).default(20), LOG_LEVEL:z.string().default('info')
}).superRefine((v,ctx)=>{if(v.MEDIASOUP_MIN_PORT>=v.MEDIASOUP_MAX_PORT)ctx.addIssue({code:'custom',path:['MEDIASOUP_MAX_PORT'],message:'must exceed MEDIASOUP_MIN_PORT'});});
const parsed=schema.safeParse(process.env);
if(!parsed.success){console.error('Invalid environment configuration:',parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));process.exit(1);}
export const env=Object.freeze(parsed.data);
export const corsOrigins=Object.freeze(env.CORS_ORIGINS.split(',').map(s=>s.trim()).filter(Boolean));
