import { NextResponse } from 'next/server';
import { COOKIE, dashboardCookieOptions, isDashboardConfigured, makeSession } from '@/lib/auth';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!isDashboardConfigured()) return NextResponse.json({error:'Dashboard password is not configured.'},{status:503});
 let body:any;try{body=await req.json();}catch{return NextResponse.json({error:'Invalid request.'},{status:400});}
 const token=makeSession(String(body?.password??''));
 if(!token)return NextResponse.json({error:'Incorrect password.'},{status:401});
 const response=NextResponse.json({ok:true});response.cookies.set(COOKIE,token,dashboardCookieOptions());return response;
}
