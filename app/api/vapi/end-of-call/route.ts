import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { saveCall } from '@/lib/supabase';
export const dynamic='force-dynamic';
const str=(v:any):string|null=>typeof v==='string'&&v.trim()?v.trim():null;
function same(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function structured(message:any){
 return message?.analysis?.structuredData ?? message?.artifact?.structuredData ?? message?.structuredData ?? {};
}
export async function POST(req:Request){
 const secret=process.env.VAPI_WEBHOOK_SECRET;
 if(!secret) return NextResponse.json({error:'Webhook is not configured.'},{status:503});
 const received=req.headers.get('x-vapi-secret')||req.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
 if(!same(received,secret)) return NextResponse.json({error:'Unauthorized webhook'},{status:401});
 let body:any;try{body=await req.json();}catch{return NextResponse.json({error:'Invalid JSON'},{status:400});}
 const m=body?.message??body;
 if(m?.type && m.type!=='end-of-call-report') return NextResponse.json({ok:true,ignored:true});
 const call=m?.call??{};const extracted=structured(m);
 const messages=Array.isArray(m?.messages)?m.messages:Array.isArray(m?.artifact?.messages)?m.artifact.messages:[];
 const transcript=str(m?.transcript)??str(m?.artifact?.transcript)??messages.map((x:any)=>`${x.role==='assistant'?'Assistant':'Caller'}: ${typeof x.content==='string'?x.content:''}`).filter(Boolean).join('\n');
 const callerNumber=str(call?.customer?.number)??str(call?.from?.number)??str(call?.customerNumber)??str(m?.customer?.number);
 const callerName=str(extracted?.caller_name)??str(extracted?.name)??str(call?.customer?.name)??null;
 const row={
  vapi_call_id:str(call?.id)??str(m?.callId)??str(m?.id)??`no-id-${Date.now()}`,
  caller_number:callerNumber, caller_name:callerName,
  business_name:str(extracted?.business_name)??str(extracted?.businessName),
  need:str(extracted?.need)??str(extracted?.what_they_need)??str(m?.summary),
  demo_time_requested:str(extracted?.demo_time_requested)??str(extracted?.demoTimeRequested),
  duration_seconds:typeof m?.durationSeconds==='number'?Math.round(m.durationSeconds):typeof call?.durationSeconds==='number'?Math.round(call.durationSeconds):null,
  transcript, summary:str(m?.summary)??str(m?.analysis?.summary),
  is_test:Boolean(call?.metadata?.isTest??call?.metadata?.is_test??false),
 };
 if(row.vapi_call_id.startsWith('no-id-')) return NextResponse.json({error:'Call ID missing from Vapi report'},{status:400});
 try{
  await saveCall(row);
  // Email is intentionally not guessed. Until a provider is integrated, summary is stored in the dashboard.
  return NextResponse.json({ok:true,leadSummary:{name:row.caller_name,number:row.caller_number,need:row.need,demoTime:row.demo_time_requested,emailStatus:'not-configured'}},{status:200});
 }catch(e){console.error('Vapi end-of-call save failed:',e);return NextResponse.json({error:'Could not persist call report'},{status:500});}
}
