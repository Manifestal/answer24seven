import { dashboardAuthorized, isDashboardConfigured } from '@/lib/auth';
import Dashboard from './ui/dashboard';
export const dynamic='force-dynamic';
export default async function Home() {
  const configured=isDashboardConfigured();
  const authorized=configured && await dashboardAuthorized();
  return <Dashboard configured={configured} authorized={authorized}/>;
}
