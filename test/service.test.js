import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
process.env.PUBLIC_BASE_URL='https://calls.example.test';
process.env.JWT_SECRET='test-jwt-secret-at-least-32-characters-long';
process.env.MYSQL_PASSWORD='test-password';
process.env.MEDIASOUP_ANNOUNCED_IP='127.0.0.1';
process.env.TURN_HOST='calls.example.test';
process.env.TURN_SECRET='test-turn-secret-at-least-32-characters-long';
process.env.TURN_REALM='calls.example.test';
const { CallService } = await import('../src/calls/service.js');
function fakeRepository(){let stored=null;return{
 async create({callerId,calleeId,participantIds,callType,callMode}){stored={id:'00000000-0000-4000-8000-000000000001',caller_user_id:callerId,callee_user_id:calleeId,call_type:callType,call_mode:callMode,state:'ringing',participants:[{user_id:callerId,role:'caller',participant_state:'accepted'},...participantIds.map(user_id=>({user_id,role:'member',participant_state:'ringing'}))]};return structuredClone(stored);},
 async getById(){return stored?structuredClone({...stored,participant_user_ids:stored.participants.map(p=>p.user_id)}):null;},
 async transition({call,nextState,actorId,action}){if(!stored||stored.state!==call.state)return{conflict:true,call:structuredClone(stored)};stored.state=nextState;if(nextState==='connecting')stored.accepted_by=actorId;return{call:structuredClone({...stored,participant_user_ids:stored.participants.map(p=>p.user_id)})};},
 async setParticipantState({userId,state}){const p=stored?.participants.find(p=>p.user_id===userId);if(!p)return false;p.participant_state=state;return true;},
 async listParticipants(){return structuredClone(stored?.participants??[]);},
 async expireRingingCalls(){return[];}
};}
test('group invite acceptance moves call to connecting and accepts participant',async()=>{const repository=fakeRepository();const mediaCalls=[];const events=[];const service=new CallService({repository,mediaManager:{async createRouter(id){mediaCalls.push(id);},closeCall(){}},hub:{broadcastCall(call,event){events.push({call,event});}}});const created=await service.create({callerId:'alice',participantIds:['bob','carol'],callType:'video'});assert.equal(created.call_mode,'group');assert.equal(created.participants.length,3);const accepted=await service.act({callId:created.id,actorId:'bob',action:'accept'});assert.equal(accepted.state,'connecting');assert.equal(accepted.participants.find(p=>p.user_id==='bob').participant_state,'accepted');assert.equal(mediaCalls.length,1);assert.equal(events.at(-1).event.type,'call.accepted');});
test('additional group participant can join after first acceptance',async()=>{const repository=fakeRepository();const service=new CallService({repository,mediaManager:{async createRouter(){},closeCall(){}},hub:{broadcastCall(){}}});const created=await service.create({callerId:'alice',participantIds:['bob','carol'],callType:'audio'});await service.act({callId:created.id,actorId:'bob',action:'accept'});const joined=await service.act({callId:created.id,actorId:'carol',action:'accept'});assert.equal(joined.state,'connecting');assert.equal(joined.participants.find(p=>p.user_id==='carol').participant_state,'accepted');});
test('non-participants cannot read call state',async()=>{const repository=fakeRepository();const service=new CallService({repository,hub:{broadcastCall(){}}});const created=await service.create({callerId:'alice',calleeId:'bob',callType:'audio'});await assert.rejects(()=>service.getForParticipant(created.id,'mallory'),{status:403,code:'forbidden_participant'});});
