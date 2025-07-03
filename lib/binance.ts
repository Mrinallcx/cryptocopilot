const BINANCE_BASE_URL = 'https://api.binance.com';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Fallback function to get data from CoinGecko when Binance API returns 451 error, and implement retry logic with different endpoints
async function getCoinGeckoFallback(symbol: string, type: 'ticker' | 'orderbook' | 'trades') {
  try {
    console.log(`CoinGecko Fallback: Fetching ${type} for symbol: ${symbol}`);
    
    // Convert Binance symbol to CoinGecko format (e.g., BTCUSDT -> bitcoin)
    const baseSymbol = symbol.replace(/USDT|BUSD|BNB$/i, '').toLowerCase();
    
    if (type === 'ticker') {
      const response = await fetch(`${COINGECKO_BASE_URL}/simple/price?ids=${baseSymbol}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BharatX/1.0',
        },
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`CoinGecko Fallback: Successfully fetched ticker for ${symbol}`);
      
      // Transform CoinGecko data to match Binance format
      return {
        symbol: symbol,
        priceChange: data[baseSymbol]?.usd_24h_change || 0,
        priceChangePercent: data[baseSymbol]?.usd_24h_change || 0,
        weightedAvgPrice: data[baseSymbol]?.usd || 0,
        prevClosePrice: data[baseSymbol]?.usd || 0,
        lastPrice: data[baseSymbol]?.usd || 0,
        volume: data[baseSymbol]?.usd_24h_vol || 0,
        quoteVolume: data[baseSymbol]?.usd_24h_vol || 0,
        openPrice: data[baseSymbol]?.usd || 0,
        highPrice: data[baseSymbol]?.usd || 0,
        lowPrice: data[baseSymbol]?.usd || 0,
        count: 0,
        source: 'CoinGecko (Fallback)'
      };
    }
    
    // For other types, return a simplified response
    return {
      symbol: symbol,
      message: `${type} data not available via fallback API`,
      source: 'CoinGecko (Fallback)'
    };
  } catch (error) {
    console.error(`CoinGecko Fallback: Error fetching ${type} for ${symbol}:`, error);
    throw error;
  }
}

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
    
    if (response.status === 451) {
      console.log(`Binance API blocked (451), using CoinGecko fallback for ${symbol}`);
      return await getCoinGeckoFallback(symbol, 'ticker');
    }
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched ticker for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching ticker for ${symbol}:`, error);
    
    // Try fallback if it's a network error or 451
    if (error instanceof Error && (error.message.includes('451') || error.message.includes('fetch'))) {
      console.log(`Attempting CoinGecko fallback for ${symbol}`);
      try {
        return await getCoinGeckoFallback(symbol, 'ticker');
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
      }
    }
    
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
    
    if (response.status === 451) {
      console.log(`Binance API blocked (451), using CoinGecko fallback for ${symbol}`);
      return await getCoinGeckoFallback(symbol, 'orderbook');
    }
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched order book for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching order book for ${symbol}:`, error);
    
    // Try fallback if it's a network error or 451
    if (error instanceof Error && (error.message.includes('451') || error.message.includes('fetch'))) {
      console.log(`Attempting CoinGecko fallback for ${symbol}`);
      try {
        return await getCoinGeckoFallback(symbol, 'orderbook');
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
      }
    }
    
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
    
    if (response.status === 451) {
      console.log(`Binance API blocked (451), using CoinGecko fallback for ${symbol}`);
      return await getCoinGeckoFallback(symbol, 'trades');
    }
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched trades for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching trades for ${symbol}:`, error);
    
    // Try fallback if it's a network error or 451
    if (error instanceof Error && (error.message.includes('451') || error.message.includes('fetch'))) {
      console.log(`Attempting CoinGecko fallback for ${symbol}`);
      try {
        return await getCoinGeckoFallback(symbol, 'trades');
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
      }
    }
    
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
    
    if (response.status === 451) {
      console.log(`Binance API blocked (451), using CoinGecko fallback for ${symbol}`);
      return await getCoinGeckoFallback(symbol, 'ticker');
    }
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched klines for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching klines for ${symbol}:`, error);
    
    // Try fallback if it's a network error or 451
    if (error instanceof Error && (error.message.includes('451') || error.message.includes('fetch'))) {
      console.log(`Attempting CoinGecko fallback for ${symbol}`);
      try {
        return await getCoinGeckoFallback(symbol, 'ticker');
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
      }
    }
    
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
    
    if (response.status === 451) {
      console.log('Binance API blocked (451), returning fallback exchange info');
      return {
        symbols: [
          { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', status: 'TRADING' },
        ],
        source: 'Fallback (Binance API blocked)'
      };
    }
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched exchange info with ${data.symbols?.length || 0} symbols`);
    return data;
  } catch (error) {
    console.error('Binance API: Error fetching exchange info:', error);
    
    // Return fallback data if it's a network error or 451
    if (error instanceof Error && (error.message.includes('451') || error.message.includes('fetch'))) {
      console.log('Returning fallback exchange info due to API block');
      return {
        symbols: [
          { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT', status: 'TRADING' },
          { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', status: 'TRADING' },
        ],
        source: 'Fallback (Binance API blocked)'
      };
    }
    
    throw error;
  }
} 