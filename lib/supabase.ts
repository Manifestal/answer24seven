export type CallRecord = {
  id: string; vapi_call_id: string; caller_number: string | null; caller_name: string | null;
  business_name: string | null; need: string | null; demo_time_requested: string | null;
  duration_seconds: number | null; transcript: string | null; summary: string | null;
  created_at: string; is_test: boolean;
};
function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  return { url, key };
}
export async function saveCall(row: Omit<CallRecord, 'id' | 'created_at'>) {
  const {url,key}=config();
  const res=await fetch(`${url}/rest/v1/calls?on_conflict=vapi_call_id`,{
    method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=representation'},
    body:JSON.stringify(row),cache:'no-store'
  });
  if(!res.ok) throw new Error(`Supabase insert failed (${res.status}): ${await res.text()}`);
  return res.json();
}
export async function listCalls(): Promise<CallRecord[]> {
  const {url,key}=config();
  const res=await fetch(`${url}/rest/v1/calls?select=id,vapi_call_id,caller_number,caller_name,business_name,need,demo_time_requested,duration_seconds,transcript,summary,created_at,is_test&order=created_at.desc&limit=100`,{
    headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store'
  });
  if(!res.ok) throw new Error(`Supabase query failed (${res.status})`);
  return res.json();
}
