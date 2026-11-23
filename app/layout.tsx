import type { Metadata } from 'next';
import './styles.css';
export const metadata: Metadata = { title:'Answer24Seven · Recent calls', description:'Answer24Seven AI receptionist call dashboard' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
