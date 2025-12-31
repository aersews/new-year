import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is not defined in environment variables");
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin_auth');

    // In a real app, use a proper session/JWT. 
    // For this simple requirement, checking if the cookie matches a hash or just the password (if over https) is "simple".
    // We'll assume the cookie holds a simple "authenticated" value signed or just the password hash.
    // Let's just check if the cookie exists and equals a specific value we set on login.
    return authCookie?.value === 'true';
}
