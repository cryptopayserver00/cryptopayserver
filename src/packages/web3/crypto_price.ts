import axios from 'axios';

export class CRYPTOPRICE {
  static apiKey = process.env.COINGECKO_AUTH;
  static coinGeckoUrl = 'https://api.coingecko.com/api/v3';

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static async getCryptoPriceByCoinGecko(ids: string, currency: string): Promise<any> {
    try {
      const include_market_cap = 'true';
      const include_24hr_vol = 'true';
      const include_24hr_change = 'true';
      const include_last_updated_at = 'true';
      const precision = 8;

      const url =
        this.coinGeckoUrl +
        '/simple/price?ids=' +
        ids +
        '&vs_currencies=' +
        currency +
        '&include_market_cap=' +
        include_market_cap +
        '&include_24hr_vol=' +
        include_24hr_vol +
        '&include_24hr_change=' +
        include_24hr_change +
        '&include_last_updated_at=' +
        include_last_updated_at +
        '&precision=' +
        precision;

      const response = await this.axiosInstance.get(url, {
        headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': this.apiKey,
        },
      });

      if (response && response.data) {
        return response.data;
      }

      throw new Error('can not get the crypto price');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the crypto price');
    }
  }
}
