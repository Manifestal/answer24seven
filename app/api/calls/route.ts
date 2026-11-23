import { NextResponse } from 'next/server';
import { dashboardAuthorized } from '@/lib/auth';
import { listCalls } from '@/lib/supabase';
export const dynamic='force-dynamic';
export async function GET(){
 if(!(await dashboardAuthorized())) return NextResponse.json({error:'Unauthorized'},{status:401});
 try{return NextResponse.json({calls:await listCalls()},{headers:{'Cache-Control':'no-store'}});}
 catch(e){console.error('Calls query failed:',e);return NextResponse.json({error:'Calls unavailable. Verify Supabase configuration and schema.'},{status:503});}
}
