// App configuration
interface Config {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
}

export const config: Config = {
  // App configuration
  app: {
    name: 'Skrawl',
    version: '1.0.0',
    environment: 'development',
  },
};

export default config;
