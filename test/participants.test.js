import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCallParticipants } from '../src/calls/participants.js';
test('normalizes a one-to-one call',()=>{assert.deepEqual(normalizeCallParticipants({callerId:'caller',calleeUserId:'callee'}),{participantIds:['callee'],calleeId:'callee',callMode:'direct',totalParticipants:2});});
test('normalizes group recipients and caps total invitees',()=>{const result=normalizeCallParticipants({callerId:'a',participantUserIds:['b','c','d']});assert.equal(result.callMode,'group');assert.equal(result.totalParticipants,4);assert.equal(result.calleeId,'b');});
test('rejects self-calls and duplicate recipients',()=>{assert.throws(()=>normalizeCallParticipants({callerId:'a',calleeUserId:'a'}),{code:'self_call'});assert.throws(()=>normalizeCallParticipants({callerId:'a',participantUserIds:['b','b']}),{code:'duplicate_participant'});});
test('rejects too many recipients',()=>{assert.throws(()=>normalizeCallParticipants({callerId:'a',participantUserIds:Array.from({length:16},(_,i)=>String(i))}),{code:'too_many_participants'});});
