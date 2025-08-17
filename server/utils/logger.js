import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  redact: {
    paths: [
      'password', '*.password',
      'headers.authorization', 'req.headers.authorization',
      'cookies', 'req.cookies', 'refreshToken', 'accessToken',
      'body.password', 'req.body.password'
    ],
    remove: true
  },
  transport: isProd ? undefined : {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard' }
  }
});

export default logger;