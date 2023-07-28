import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type HeadersDefaults,
} from 'axios';
import Base from '../Base';
import type Client from '../Client';

interface RequestHeaders {
  [key: string]: any;
}

type RequestConfig = Omit<AxiosRequestConfig, 'headers'> & {
  headers?: RequestHeaders;
};

class HTTP extends Base {
  private axios: AxiosInstance;

  private readonly restRetryLimit: number;

  constructor(client: Client, { restRetryLimit = 5 } = {}) {
    super(client);

    this.restRetryLimit = restRetryLimit;

    this.axios = axios.create({
      headers: {
        'Content-Type': null,
      },
    });

    (
      Object.keys(this.axios.defaults.headers) as (keyof HeadersDefaults)[]
    ).forEach((h) => {
      delete this.axios.defaults.headers[h]?.['Content-Type'];
    });
  }

  public async request<T = any>(
    config: RequestConfig,
    retries = 0,
  ): Promise<T> {
    const reqStartTime = Date.now();
    try {
      const response = await this.axios.request<T>({
        ...config,
        headers: {
          ...config.headers,
        },
      });

      const reqDuration = (Date.now() - reqStartTime) / 1000;
      this.client.debug(
        `${config.method?.toUpperCase() ?? 'GET'} ${
          config.url
        } (${reqDuration.toFixed(2)}s): ` +
          `${response.status} ${response.statusText}`,
        'http',
      );

      return response.data;
    } catch (err: any) {
      const reqDuration = (Date.now() - reqStartTime) / 1000;
      if (err instanceof AxiosError) {
        const errResponse = err.response;

        this.client.debug(
          `${config.method?.toUpperCase() ?? 'GET'} ${
            config.url
          } (${reqDuration.toFixed(2)}s): ` +
            `${errResponse?.status} ${errResponse?.statusText}`,
          'http',
        );

        if (
          errResponse?.status.toString().startsWith('5') &&
          retries < this.restRetryLimit
        ) {
          return this.request(config, retries + 1);
        }

        if (errResponse && errResponse.status === 429) {
          const retryString = errResponse.headers['retry-after'];
          const retryAfter = parseInt(retryString, 10);
          if (!Number.isNaN(retryAfter)) {
            const sleepTimeout = retryAfter * 1000 + 500;
            await new Promise((res) => setTimeout(res, sleepTimeout));

            return this.request(config, retries);
          }
        }
      } else {
        this.client.debug(
          `${config.method?.toUpperCase() ?? 'GET'} ${config.url} ` +
            `(${reqDuration.toFixed(2)}s): ${err.name} - ${err.message}`,
          'http',
        );
      }

      throw err;
    }
  }

  public async paymagicAPIRequest<T = any>(
    method: AxiosRequestConfig['method'],
    url: string,
    config: RequestConfig = {},
    retries = 0,
  ): Promise<T> {
    return this.request<T>(
      {
        method,
        baseURL: `${this.client.config.paymagicBaseURL}/${this.client.config.paymagicAPIVersion}`,
        url,
        ...config,
        headers: {
          ...config.headers,
        },
      },
      retries,
    );
  }
}

export default HTTP;
