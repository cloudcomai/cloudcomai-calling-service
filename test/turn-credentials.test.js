import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createTurnCredentials } from '../src/media/turn-credentials.js';
test('TURN credentials use timestamped username and HMAC-SHA1',()=>{const nowMs=1800000000000;const secret='test-turn-secret';const c=createTurnCredentials('user-123',{secret,host:'calls.example.com',port:3478,nowMs});const username=`${Math.floor(nowMs/1000)+3600}:user-123`;assert.equal(c.username,username);assert.equal(c.credential,createHmac('sha1',secret).update(username).digest('base64'));assert.equal(c.ttlSeconds,3600);assert.deepEqual(c.iceServers[0].urls,['turn:calls.example.com:3478?transport=udp','turn:calls.example.com:3478?transport=tcp']);});
test('TURN credential is scoped to the requested user',()=>{const opts={secret:'test-turn-secret',host:'calls.example.com',nowMs:1800000000000};const a=createTurnCredentials('user-a',opts),b=createTurnCredentials('user-b',opts);assert.notEqual(a.username,b.username);assert.notEqual(a.credential,b.credential);});
