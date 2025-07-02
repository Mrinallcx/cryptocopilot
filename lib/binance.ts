const BINANCE_BASE_URL = 'https://api.binance.com';

export async function getBinanceTicker(symbol: string) {
  try {
    console.log(`Binance API: Fetching ticker for symbol: ${symbol}`);
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/ticker/24hr?symbol=${symbol}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched ticker for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching ticker for ${symbol}:`, error);
    throw error;
  }
}

export async function getBinanceOrderBook(symbol: string, limit: number = 100) {
  try {
    console.log(`Binance API: Fetching order book for symbol: ${symbol}, limit: ${limit}`);
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/depth?symbol=${symbol}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched order book for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching order book for ${symbol}:`, error);
    throw error;
  }
}

export async function getBinanceTrades(symbol: string, limit: number = 100) {
  try {
    console.log(`Binance API: Fetching trades for symbol: ${symbol}, limit: ${limit}`);
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/trades?symbol=${symbol}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched trades for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching trades for ${symbol}:`, error);
    throw error;
  }
}

export async function getBinanceKlines(symbol: string, interval: string = '1d', limit: number = 100) {
  try {
    console.log(`Binance API: Fetching klines for symbol: ${symbol}, interval: ${interval}, limit: ${limit}`);
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched klines for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching klines for ${symbol}:`, error);
    throw error;
  }
}

export async function getBinanceExchangeInfo() {
  try {
    console.log('Binance API: Fetching exchange info');
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/exchangeInfo`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout for larger response
    });
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched exchange info with ${data.symbols?.length || 0} symbols`);
    return data;
  } catch (error) {
    console.error('Binance API: Error fetching exchange info:', error);
    throw error;
  }
} 