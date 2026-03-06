import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  let query = supabase
    .from('market_data')
    .select('*')
    .order('time', { ascending: false })
    .limit(limit);

  if (symbol) {
    query = query.eq('symbol', symbol);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data.reverse()); // Return chronologically
}
