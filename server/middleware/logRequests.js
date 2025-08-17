import onFinished from 'on-finished';
import logger from '../utils/logger.js';

export default function logRequests(req, res, next) {
  const start = process.hrtime.bigint();
  const child = logger.child({ reqId: req.id, method: req.method, url: req.url });

  child.debug({ headers: req.headers }, 'req:start');

  onFinished(res, () => {
    const durMs = Number((process.hrtime.bigint() - start) / 1000000n);
    child.info({ status: res.statusCode, durMs }, 'req:end');
  });

  next();
}