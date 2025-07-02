const BINANCE_BASE_URL = 'https://api.binance.com';

export async function getBinanceTicker(symbol: string) {
  const response = await fetch(`${BINANCE_BASE_URL}/api/v3/ticker/24hr?symbol=${symbol}`);
  return response.json();
}

export async function getBinanceOrderBook(symbol: string, limit: number = 100) {
  const response = await fetch(`${BINANCE_BASE_URL}/api/v3/depth?symbol=${symbol}&limit=${limit}`);
  return response.json();
}

export async function getBinanceTrades(symbol: string, limit: number = 100) {
  const response = await fetch(`${BINANCE_BASE_URL}/api/v3/trades?symbol=${symbol}&limit=${limit}`);
  return response.json();
}

export async function getBinanceKlines(symbol: string, interval: string = '1d', limit: number = 100) {
  const response = await fetch(`${BINANCE_BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  return response.json();
}

export async function getBinanceExchangeInfo() {
  const response = await fetch(`${BINANCE_BASE_URL}/api/v3/exchangeInfo`);
  return response.json();
} 