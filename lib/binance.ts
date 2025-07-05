const BINANCE_BASE_URL = 'https://api.binance.com';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Improved timeout function that works better in Vercel
function createTimeout(ms: number): AbortSignal {
  try {
    return AbortSignal.timeout(ms);
  } catch (error) {
    // Fallback for environments that don't support AbortSignal.timeout
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }
}

// Enhanced fetch wrapper with better error handling
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: createTimeout(15000), // 15 second timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; SciraBot/1.0)',
          ...options.headers,
        },
      });
      
      console.log(`API Request (attempt ${i + 1}): ${response.status} ${response.statusText} for ${url}`);
      
      if (response.status === 451) {
        console.log('451 detected - API blocked in this region');
        throw new Error('API_BLOCKED_451');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP_${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.error(`API Request failed (attempt ${i + 1}):`, error);
      
      if (i === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('All retry attempts failed');
}

// Fallback function to get data from CoinGecko when Binance API returns 451 error
async function getCoinGeckoFallback(symbol: string, type: 'ticker' | 'orderbook' | 'trades') {
  try {
    console.log(`CoinGecko Fallback: Fetching ${type} for symbol: ${symbol}`);
    
    // Convert Binance symbol to CoinGecko format (e.g., BTCUSDT -> bitcoin)
    const baseSymbol = symbol.replace(/USDT|BUSD|BNB$/i, '').toLowerCase();
    console.log(`CoinGecko Fallback: Converted ${symbol} to ${baseSymbol}`);
    
    if (type === 'ticker') {
      const url = `${COINGECKO_BASE_URL}/simple/price?ids=${baseSymbol}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
      console.log(`CoinGecko Fallback: Making request to: ${url}`);
      
      const response = await fetchWithRetry(url, {
        method: 'GET',
      });
      
      const data = await response.json();
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
    
    const response = await fetchWithRetry(url, {
      method: 'GET',
    });
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched ticker for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching ticker for ${symbol}:`, error);
    
    // Try fallback for any error (not just 451)
    if (error instanceof Error) {
      console.log(`Attempting CoinGecko fallback for ${symbol}`);
      try {
        return await getCoinGeckoFallback(symbol, 'ticker');
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
        throw new Error(`Failed to fetch ticker data for ${symbol}. Both Binance API and fallback failed.`);
      }
    }
    
    throw error;
  }
}

export async function getBinanceOrderBook(symbol: string, limit: number = 100) {
  try {
    console.log(`Binance API: Fetching order book for symbol: ${symbol}, limit: ${limit}`);
    const url = `${BINANCE_BASE_URL}/api/v3/depth?symbol=${symbol}&limit=${limit}`;
    
    const response = await fetchWithRetry(url, {
      method: 'GET',
    });
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched order book for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching order book for ${symbol}:`, error);
    
    // Try fallback for any error
    if (error instanceof Error) {
      console.log(`Attempting CoinGecko fallback for ${symbol}`);
      try {
        return await getCoinGeckoFallback(symbol, 'orderbook');
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
        throw new Error(`Failed to fetch order book data for ${symbol}. Both Binance API and fallback failed.`);
      }
    }
    
    throw error;
  }
}

export async function getBinanceTrades(symbol: string, limit: number = 100) {
  try {
    console.log(`Binance API: Fetching trades for symbol: ${symbol}, limit: ${limit}`);
    const url = `${BINANCE_BASE_URL}/api/v3/trades?symbol=${symbol}&limit=${limit}`;
    
    const response = await fetchWithRetry(url, {
      method: 'GET',
    });
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched trades for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching trades for ${symbol}:`, error);
    
    // Try fallback for any error
    if (error instanceof Error) {
      console.log(`Attempting CoinGecko fallback for ${symbol}`);
      try {
        return await getCoinGeckoFallback(symbol, 'trades');
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
        throw new Error(`Failed to fetch trades data for ${symbol}. Both Binance API and fallback failed.`);
      }
    }
    
    throw error;
  }
}

export async function getBinanceKlines(symbol: string, interval: string = '1d', limit: number = 100) {
  try {
    console.log(`Binance API: Fetching klines for symbol: ${symbol}, interval: ${interval}, limit: ${limit}`);
    const url = `${BINANCE_BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    
    const response = await fetchWithRetry(url, {
      method: 'GET',
    });
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched klines for ${symbol}`);
    return data;
  } catch (error) {
    console.error(`Binance API: Error fetching klines for ${symbol}:`, error);
    
    // Try fallback for any error
    if (error instanceof Error) {
      console.log(`Attempting CoinGecko fallback for ${symbol}`);
      try {
        return await getCoinGeckoFallback(symbol, 'ticker');
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${symbol}:`, fallbackError);
        throw new Error(`Failed to fetch klines data for ${symbol}. Both Binance API and fallback failed.`);
      }
    }
    
    throw error;
  }
}

export async function getBinanceExchangeInfo() {
  try {
    console.log('Binance API: Fetching exchange info');
    const url = `${BINANCE_BASE_URL}/api/v3/exchangeInfo`;
    
    const response = await fetchWithRetry(url, {
      method: 'GET',
    });
    
    const data = await response.json();
    console.log(`Binance API: Successfully fetched exchange info with ${data.symbols?.length || 0} symbols`);
    return data;
  } catch (error) {
    console.error('Binance API: Error fetching exchange info:', error);
    
    // Return fallback data for any error
    console.log('Returning fallback exchange info due to API error');
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
      source: 'Fallback (Binance API unavailable)'
    };
  }
}

// Enhanced test function to debug API connectivity
export async function testBinanceConnectivity() {
  console.log('=== BINANCE API CONNECTIVITY TEST ===');
  
  try {
    // Test basic connectivity
    console.log('Testing basic connectivity...');
    const pingResponse = await fetchWithRetry('https://api.binance.com/api/v3/ping', {
      method: 'GET',
    });
    
    if (pingResponse.ok) {
      const pingData = await pingResponse.json();
      console.log('✅ Ping successful:', pingData);
    }
    
    // Test ticker endpoint
    console.log('Testing ticker endpoint...');
    try {
      const tickerResponse = await fetchWithRetry('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
        method: 'GET',
      });
      
      if (tickerResponse.ok) {
        const tickerData = await tickerResponse.json();
        console.log('✅ Binance API working, ticker data received');
      }
    } catch (tickerError) {
      console.log('❌ Binance ticker failed:', tickerError);
    }
    
    // Test CoinGecko fallback
    console.log('Testing CoinGecko fallback...');
    try {
      const coingeckoResponse = await fetchWithRetry('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
        method: 'GET',
      });
      
      if (coingeckoResponse.ok) {
        const coingeckoData = await coingeckoResponse.json();
        console.log('✅ CoinGecko API working, data received');
      }
    } catch (coingeckoError) {
      console.log('❌ CoinGecko API failed:', coingeckoError);
    }
    
    // Test our wrapper function
    console.log('Testing wrapper function...');
    try {
      const result = await getBinanceTicker('BTCUSDT');
      console.log('✅ Wrapper function working, result source:', result.source || 'Binance API');
    } catch (wrapperError) {
      console.log('❌ Wrapper function failed:', wrapperError);
    }
    
  } catch (error) {
    console.error('❌ Connectivity test failed:', error);
  }
  
  console.log('=== END CONNECTIVITY TEST ===');
} 