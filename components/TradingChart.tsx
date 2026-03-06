'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import { Candle } from '@/lib/smc';

interface TradingChartProps {
  data: Candle[];
  symbol: string;
}

export default function TradingChart({ data, symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#141414' },
        textColor: '#d9d9d9',
      },
      grid: {
        vertLines: { color: '#2b2b2b' },
        horzLines: { color: '#2b2b2b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      // lightweight-charts expects time in seconds for UNIX timestamps
      const formattedData = data.map(d => ({
        time: (d.time / 1000) as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      
      // Ensure data is sorted by time and unique
      const uniqueData = Array.from(new Map(formattedData.map(item => [item.time, item])).values())
        .sort((a, b) => a.time - b.time);

      seriesRef.current.setData(uniqueData);
    }
  }, [data]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-white/10 relative">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-sm font-mono text-white">
        {symbol}
      </div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
