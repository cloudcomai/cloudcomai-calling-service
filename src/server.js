import http from 'node:http';
import { env } from './config/env.js';
import { logger } from './logger.js';
import { pool } from './db/pool.js';
import { CallRepository } from './calls/repository.js';
import { CallService } from './calls/service.js';
import { MediaManager } from './media/manager.js';
import { RealtimeHub } from './realtime/hub.js';
import { createApp } from './app.js';
const repository=new CallRepository();const mediaManager=new MediaManager();let app,hub,server,stopHeartbeat;
async function start(){await repository.ping();await mediaManager.start();server=http.createServer((req,res)=>app(req,res));hub=new RealtimeHub(server);const callService=new CallService({repository,hub,mediaManager});app=createApp({callService,repository,mediaManager});stopHeartbeat=hub.heartbeat();server.listen(env.PORT,env.HOST,()=>logger.info({host:env.HOST,port:env.PORT},'calling service listening'));}
let shuttingDown=false;async function shutdown(signal){if(shuttingDown)return;shuttingDown=true;logger.info({signal},'shutting down');stopHeartbeat?.();hub?.close();if(server)await new Promise(resolve=>server.close(resolve));await mediaManager.close().catch(error=>logger.error({err:error},'media shutdown failed'));await pool.end().catch(error=>logger.error({err:error},'database shutdown failed'));process.exit(0);}
process.on('SIGTERM',()=>shutdown('SIGTERM'));process.on('SIGINT',()=>shutdown('SIGINT'));start().catch(error=>{logger.fatal({err:error},'startup failed');process.exit(1);});
