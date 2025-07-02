import axios from 'axios';

const BASE_URL = 'https://exchange-api.lcx.com';
const API_VERSION = '1.1.0';

export async function getOrderBook(pair: string) {
  console.log(`LCX API: Fetching order book for pair: ${pair}`);
  const res = await axios.get(`${BASE_URL}/api/book`, {
    params: { pair },
    headers: { 'API-VERSION': API_VERSION },
  });
  return res.data;
}

export async function getTicker(pair: string) {
  console.log(`LCX API: Fetching ticker for pair: ${pair}`);
  const res = await axios.get(`${BASE_URL}/api/ticker`, {
    params: { pair },
    headers: { 'API-VERSION': API_VERSION },
  });
  return res.data;
}

// Get tickers for multiple pairs (since /api/tickers doesn't exist, we make individual calls)
export async function getTickers(pairs: string[]) {
  console.log(`LCX API: Fetching tickers for ${pairs.length} pairs:`, pairs);
  
  try {
    const tickerPromises = pairs.map(async (pair) => {
      try {
        const ticker = await getTicker(pair);
        return { pair, success: true, data: ticker };
      } catch (error) {
        console.error(`LCX API: Error fetching ticker for ${pair}:`, error);
        return { pair, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(tickerPromises);
    
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);
    
    console.log(`LCX API: Successfully fetched ${successful.length} tickers, ${failed.length} failed`);
    
    return {
      success: true,
      data: {
        successful,
        failed,
        total: results.length,
        successfulCount: successful.length,
        failedCount: failed.length
      },
      source: 'LCX Exchange API'
    };
  } catch (error) {
    console.error('LCX API: Error in getTickers:', error);
    throw error;
  }
}

export async function getTrades(pair: string) {
  console.log(`LCX API: Fetching trades for pair: ${pair}`);
  const res = await axios.get(`${BASE_URL}/api/trades`, {
    params: { pair },
    headers: { 'API-VERSION': API_VERSION },
  });
  return res.data;
}

export async function getPairs() {
  console.log('LCX API: Fetching all available pairs');
  try {
    const res = await axios.get(`${BASE_URL}/api/pairs`, {
      headers: { 'API-VERSION': API_VERSION },
    });
    console.log(`LCX API: Successfully fetched ${res.data.data?.length || 0} pairs`);
    return res.data;
  } catch (error) {
    console.error('LCX API: Error fetching pairs:', error);
    throw error;
  }
}

// Helper function to find exact pair symbol from user input
export async function findExactPair(userInput: string): Promise<string | null> {
  try {
    const pairsData = await getPairs();
    const pairs = pairsData.data || [];
    
    // Normalize user input
    const normalizedInput = userInput.toUpperCase().replace(/\s+/g, '');
    
    // Try exact match first
    const exactMatch = pairs.find((pair: any) => 
      pair.Symbol === userInput.toUpperCase() || 
      pair.Symbol === normalizedInput
    );
    
    if (exactMatch) {
      console.log(`LCX API: Found exact match for "${userInput}": ${exactMatch.Symbol}`);
      return exactMatch.Symbol;
    }
    
    // Try partial match
    const partialMatch = pairs.find((pair: any) => 
      pair.Symbol.includes(normalizedInput) || 
      normalizedInput.includes(pair.Symbol.replace('/', ''))
    );
    
    if (partialMatch) {
      console.log(`LCX API: Found partial match for "${userInput}": ${partialMatch.Symbol}`);
      return partialMatch.Symbol;
    }
    
    console.log(`LCX API: No match found for "${userInput}"`);
    return null;
  } catch (error) {
    console.error('LCX API: Error finding exact pair:', error);
    return null;
  }
} 