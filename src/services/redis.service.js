import redis from 'redis';

class RedisService {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    });
    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
    this.client.on('error', (error) => {
      console.log(`Error connecting to Redis: ${error}`);
    });
  }

  async setValue(key, value, expire) {
    return new Promise((resolve, reject) => {
      this.client.set(key, JSON.stringify(value), async (error) => {
        if (error) {
          reject(`Error setting key from Redis: ${error}`);
        } else {
          this.client.expire(key, expire, async (error) => {
            if (error) throw error;
          });
          resolve();
        }
      });
    });
  }

  async getValue(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, async (error, result) => {
        if (error) {
          reject(`Error retrieving key from Redis: ${error}`);
        } else {
          resolve(JSON.parse(result));
        }
      });
    });
  }

  async deleteValue(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, async (error) => {
        if (error) {
          reject(`Error deleting key from Redis: ${error}`);
        } else {
          resolve();
        }
      });
    });
  }
}

export default new RedisService();
