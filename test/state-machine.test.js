import test from 'node:test';
import assert from 'node:assert/strict';
import { isTerminalState, transitionCall } from '../src/calls/state-machine.js';
test('callee can accept ringing call into connecting',()=>{assert.deepEqual(transitionCall('ringing','accept','callee'),{ok:true,state:'connecting'});});
test('caller cannot accept their own outgoing call',()=>{assert.deepEqual(transitionCall('ringing','accept','caller'),{ok:false,reason:'forbidden_actor'});});
test('only caller can cancel a ringing call',()=>{assert.deepEqual(transitionCall('ringing','cancel','callee'),{ok:false,reason:'forbidden_actor'});assert.deepEqual(transitionCall('ringing','cancel','caller'),{ok:true,state:'cancelled'});});
test('terminal states cannot transition again',()=>{assert.equal(isTerminalState('ended'),true);assert.deepEqual(transitionCall('ended','end','caller'),{ok:false,reason:'call_already_terminal'});});
test('connected call can only end or fail',()=>{assert.deepEqual(transitionCall('connected','end','callee'),{ok:true,state:'ended'});assert.deepEqual(transitionCall('connected','reject','callee'),{ok:false,reason:'invalid_transition'});});
test('system can mark a ringing call no-answer',()=>{assert.deepEqual(transitionCall('ringing','no_answer','system'),{ok:true,state:'no_answer'});});
