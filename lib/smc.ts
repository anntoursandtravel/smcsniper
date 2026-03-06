export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Signal {
  id: string;
  asset: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  timestamp: number;
  confidenceScore: number;
  reason: string;
}

export interface SwingPoint {
  index: number;
  type: 'HH' | 'HL' | 'LH' | 'LL';
  price: number;
  time: number;
}

export interface OrderBlock {
  top: number;
  bottom: number;
  type: 'BULLISH' | 'BEARISH';
  time: number;
  mitigated: boolean;
}

export interface LiquidityZone {
  price: number;
  type: 'BUYSIDE' | 'SELLSIDE';
  time: number;
  swept: boolean;
}

export class SMCEngine {
  private candles: Candle[] = [];
  private swingPoints: SwingPoint[] = [];
  private orderBlocks: OrderBlock[] = [];
  private liquidityZones: LiquidityZone[] = [];
  private lookback = 5;

  public addCandle(candle: Candle) {
    this.candles.push(candle);
    this.processLatest();
  }

  public setCandles(candles: Candle[]) {
    this.candles = candles;
    this.swingPoints = [];
    this.orderBlocks = [];
    this.liquidityZones = [];
    for (let i = 0; i < this.candles.length; i++) {
      this.detectSwingPoints(i);
    }
  }

  private detectSwingPoints(index: number) {
    if (index < this.lookback || index > this.candles.length - 1 - this.lookback) return;

    let isSwingHigh = true;
    let isSwingLow = true;
    const currentHigh = this.candles[index].high;
    const currentLow = this.candles[index].low;

    for (let i = index - this.lookback; i <= index + this.lookback; i++) {
      if (i === index) continue;
      if (this.candles[i].high >= currentHigh) isSwingHigh = false;
      if (this.candles[i].low <= currentLow) isSwingLow = false;
    }

    if (isSwingHigh) {
      const lastHigh = this.swingPoints.filter(sp => sp.type === 'HH' || sp.type === 'LH').pop();
      const type = lastHigh && currentHigh > lastHigh.price ? 'HH' : 'LH';
      this.swingPoints.push({ index, type, price: currentHigh, time: this.candles[index].time });
      this.detectLiquidity(currentHigh, 'BUYSIDE', this.candles[index].time);
    }

    if (isSwingLow) {
      const lastLow = this.swingPoints.filter(sp => sp.type === 'HL' || sp.type === 'LL').pop();
      const type = lastLow && currentLow > lastLow.price ? 'HL' : 'LL';
      this.swingPoints.push({ index, type, price: currentLow, time: this.candles[index].time });
      this.detectLiquidity(currentLow, 'SELLSIDE', this.candles[index].time);
    }
  }

  private detectLiquidity(price: number, type: 'BUYSIDE' | 'SELLSIDE', time: number) {
    // Simple equal highs/lows detection
    const threshold = price * 0.0005; // 0.05% tolerance
    const existing = this.liquidityZones.find(z => z.type === type && Math.abs(z.price - price) < threshold && !z.swept);
    if (existing) {
      // Strengthen the liquidity zone
    } else {
      this.liquidityZones.push({ price, type, time, swept: false });
    }
  }

  private processLatest() {
    const currentIndex = this.candles.length - 1 - this.lookback;
    if (currentIndex >= this.lookback) {
      this.detectSwingPoints(currentIndex);
    }
  }

  public checkForSignals(asset: string): Signal | null {
    if (this.candles.length < 20) return null;
    
    const lastCandle = this.candles[this.candles.length - 1];
    const prevCandle = this.candles[this.candles.length - 2];

    // Basic BOS / CHoCH detection for signal generation
    // This is a simplified version of the SMC logic
    const lastSwingHigh = this.swingPoints.filter(sp => sp.type === 'HH' || sp.type === 'LH').pop();
    const lastSwingLow = this.swingPoints.filter(sp => sp.type === 'HL' || sp.type === 'LL').pop();

    if (!lastSwingHigh || !lastSwingLow) return null;

    // Bullish Signal Condition:
    // 1. Price breaks above last swing high (BOS/CHoCH)
    if (lastCandle.close > lastSwingHigh.price && prevCandle.close <= lastSwingHigh.price) {
      // Calculate OB (last bearish candle before the move)
      let obCandle = null;
      for (let i = this.candles.length - 2; i >= 0; i--) {
        if (this.candles[i].close < this.candles[i].open) {
          obCandle = this.candles[i];
          break;
        }
      }

      const entry = lastCandle.close;
      const sl = obCandle ? obCandle.low : lastSwingLow.price;
      const risk = entry - sl;
      
      if (risk <= 0) return null;

      return {
        id: Math.random().toString(36).substring(7),
        asset,
        direction: 'BUY',
        entryPrice: entry,
        stopLoss: sl,
        takeProfit1: entry + risk * 1.5,
        takeProfit2: entry + risk * 3,
        takeProfit3: entry + risk * 5,
        timestamp: Date.now(),
        confidenceScore: 85,
        reason: 'Bullish BOS detected with displacement.'
      };
    }

    // Bearish Signal Condition:
    if (lastCandle.close < lastSwingLow.price && prevCandle.close >= lastSwingLow.price) {
      let obCandle = null;
      for (let i = this.candles.length - 2; i >= 0; i--) {
        if (this.candles[i].close > this.candles[i].open) {
          obCandle = this.candles[i];
          break;
        }
      }

      const entry = lastCandle.close;
      const sl = obCandle ? obCandle.high : lastSwingHigh.price;
      const risk = sl - entry;

      if (risk <= 0) return null;

      return {
        id: Math.random().toString(36).substring(7),
        asset,
        direction: 'SELL',
        entryPrice: entry,
        stopLoss: sl,
        takeProfit1: entry - risk * 1.5,
        takeProfit2: entry - risk * 3,
        takeProfit3: entry - risk * 5,
        timestamp: Date.now(),
        confidenceScore: 85,
        reason: 'Bearish BOS detected with displacement.'
      };
    }

    return null;
  }

  public getSwingPoints() { return this.swingPoints; }
  public getOrderBlocks() { return this.orderBlocks; }
  public getLiquidityZones() { return this.liquidityZones; }
}
