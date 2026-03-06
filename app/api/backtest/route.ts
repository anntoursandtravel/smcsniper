import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { strategy, symbol, startDate, endDate } = body;

    // A stub for a real backtesting engine
    return NextResponse.json({
      message: 'Backtest completed successfully',
      results: {
        symbol,
        strategy,
        period: `${startDate} to ${endDate}`,
        totalTrades: 42,
        winRate: 68.5,
        profitFactor: 1.8,
        netProfit: 1250.50
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
