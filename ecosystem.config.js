module.exports = {
  apps: [{
    name: 'API',
    script: 'index.js',
    instances: 4,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],

};
