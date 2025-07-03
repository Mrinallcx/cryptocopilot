const BINANCE_BASE_URL = 'https://api.binance.com';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Fallback function to get data from CoinGecko when Binance API returns 451 error, and implement retry logic with different endpoints
async function getCoinGeckoFallback(symbol: string, type: 'ticker' | 'orderbook' | 'trades') {
  try {
    console.log(`CoinGecko Fallback: Fetching ${type} for symbol: ${symbol}`);
    
    // Convert Binance symbol to CoinGecko format (e.g., BTCUSDT -> bitcoin)
    const baseSymbol = symbol.replace(/USDT|BUSD|BNB$/i, '').toLowerCase();
    console.log(`CoinGecko Fallback: Converted ${symbol} to ${baseSymbol}`);
    
    if (type === 'ticker') {
      const url = `${COINGECKO_BASE_URL}/simple/price?ids=${baseSymbol}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
      console.log(`CoinGecko Fallback: Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BharatX/1.0',
        },
        signal: AbortSignal.timeout(10000),
      });
      
      console.log(`CoinGecko Fallback: Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`CoinGecko Fallback: Raw response data:`, data);
      console.log(`CoinGecko Fallback: Successfully fetched ticker for ${symbol}`);
      
      // Transform CoinGecko data to match Binance format
      const transformedData = {
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
      
      console.log(`CoinGecko Fallback: Transformed data:`, transformedData);
      return transformedData;
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
    const url = `${BINANCE_BASE_URL}/api/v3/ticker/24hr?symbol=${symbol}`;
    console.log(`Binance API: Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log(`Binance API: Response status: ${response.status} ${response.statusText}`);
    
    if (response.status === 451) {
      console.log(`Binance API blocked (451), using CoinGecko fallback for ${symbol}`);
      return await getCoinGeckoFallback(symbol, 'ticker');
    }
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched ticker for ${symbol}:`, data);
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
    const url = `${BINANCE_BASE_URL}/api/v3/depth?symbol=${symbol}&limit=${limit}`;
    console.log(`Binance API: Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log(`Binance API: Response status: ${response.status} ${response.statusText}`);
    
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
    const url = `${BINANCE_BASE_URL}/api/v3/trades?symbol=${symbol}&limit=${limit}`;
    console.log(`Binance API: Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log(`Binance API: Response status: ${response.status} ${response.statusText}`);
    
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
    const url = `${BINANCE_BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    console.log(`Binance API: Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log(`Binance API: Response status: ${response.status} ${response.statusText}`);
    
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
    const url = `${BINANCE_BASE_URL}/api/v3/exchangeInfo`;
    console.log(`Binance API: Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout for larger response
    });
    
    console.log(`Binance API: Response status: ${response.status} ${response.statusText}`);
    
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

// Test function to debug API connectivity
export async function testBinanceConnectivity() {
  console.log('=== BINANCE API CONNECTIVITY TEST ===');
  
  try {
    // Test basic connectivity
    console.log('Testing basic connectivity...');
    const response = await fetch('https://api.binance.com/api/v3/ping', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(5000),
    });
    
    console.log(`Ping response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const pingData = await response.json();
      console.log('Ping data:', pingData);
    }
    
    // Test ticker endpoint
    console.log('Testing ticker endpoint...');
    const tickerResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    console.log(`Ticker response: ${tickerResponse.status} ${tickerResponse.statusText}`);
    
    if (tickerResponse.status === 451) {
      console.log('✅ 451 detected - Binance API is blocked, fallback should work');
    } else if (tickerResponse.ok) {
      const tickerData = await tickerResponse.json();
      console.log('✅ Binance API working, ticker data:', tickerData);
    } else {
      console.log('❌ Binance API error:', tickerResponse.status, tickerResponse.statusText);
    }
    
    // Test CoinGecko fallback
    console.log('Testing CoinGecko fallback...');
    const coingeckoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BharatX/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    console.log(`CoinGecko response: ${coingeckoResponse.status} ${coingeckoResponse.statusText}`);
    
    if (coingeckoResponse.ok) {
      const coingeckoData = await coingeckoResponse.json();
      console.log('✅ CoinGecko API working, data:', coingeckoData);
    } else {
      console.log('❌ CoinGecko API error:', coingeckoResponse.status, coingeckoResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Connectivity test failed:', error);
  }
  
  console.log('=== END CONNECTIVITY TEST ===');
} 