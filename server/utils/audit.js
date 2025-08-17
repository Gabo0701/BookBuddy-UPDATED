// server/utils/audit.js
import logger from './logger.js';

/**
 * Write a structured security/audit log.
 * Avoid secrets. We include reqId, ip and user agent for traceability.
 */
function base(req) {
  return {
    reqId: req?.id,
    ip: req?.ip,
    ua: req?.headers?.['user-agent'],
    userId: req?.user?.id
  };
}

export function audit(event, data = {}, req) {
  logger.info({ audit: true, event, ...base(req), ...data });
}

export function auditWarn(event, data = {}, req) {
  logger.warn({ audit: true, event, ...base(req), ...data });
}

export function auditError(event, data = {}, req) {
  logger.error({ audit: true, event, ...base(req), ...data });
}