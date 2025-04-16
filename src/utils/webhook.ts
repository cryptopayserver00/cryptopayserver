import axios from 'axios';

export class WEBHOOK {
  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static async sendWebhook(url: string, body: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post(url, body);

      if (response && response.data) {
        return response.data;
      }

      throw new Error('can not send the webhook');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the webhook');
    }
  }
}
