import axios from 'axios';

let cache = {};
let lastFetched = 0;
const CACHE_DURATION = 10 * 1000; // 10 seconds

export const getCryptoPrice = async (symbol) => {
  const now = Date.now();

  if (cache[symbol] && now - lastFetched < CACHE_DURATION) {
    return cache[symbol];
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: symbol.toLowerCase(),
          vs_currencies: 'usd'
        }
      }
    );
    console.log("🚀 ~ getCryptoPrice ~ response:", response.data)

    const price = response.data[symbol.toLowerCase()].usd;
    cache[symbol] = price;
    lastFetched = now;
    return price;
  } catch (err) {
    console.error('Error fetching crypto price:', err);
    throw new Error('Price fetch failed');  
  }
};
