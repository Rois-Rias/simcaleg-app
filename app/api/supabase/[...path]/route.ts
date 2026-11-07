// app/api/supabase/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function proxyHandler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();

  // Bersihkan URL dari garis miring di akhir (jika ada)
  const baseUrl = SUPABASE_URL.replace(/\/$/, '');
  const targetUrl = `${baseUrl}/${path}${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers();
  
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (['host', 'connection', 'accept-encoding', 'origin', 'referer', 'x-forwarded-host', 'x-forwarded-proto', 'content-length'].includes(lowerKey)) {
      return;
    }
    headers.set(key, value);
  });

  if (!headers.has('apikey') && SUPABASE_ANON_KEY) {
    headers.set('apikey', SUPABASE_ANON_KEY);
  }

  let body: BodyInit | null = null;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text(); 
  }

  try {
    // Mencetak log ke terminal agar kita tahu request-nya mau ke mana
    console.log(`\n[Proxy Request] ${req.method} -> ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'manual',
    });

    console.log(`[Proxy Response] Status: ${response.status}`);

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) return;
      responseHeaders.set(key, value);
    });

    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    // MENCETAK ERROR ASLI KE TERMINAL
    console.error('\n=== SUPABASE PROXY ERROR ===');
    console.error('Target URL:', targetUrl);
    console.error('Error Message:', error instanceof Error ? error.message : error);
    console.error('============================\n');

    return new NextResponse(JSON.stringify({ error: 'Gagal terhubung ke Supabase via proxy' }), { 
      status: 502, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
export const OPTIONS = proxyHandler;