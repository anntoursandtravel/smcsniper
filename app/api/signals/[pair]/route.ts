import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pair: string }> }
) {
  const { pair } = await params;

  const { data, error } = await supabase
    .from('signals')
    .select('*')
    .eq('asset', pair)
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
