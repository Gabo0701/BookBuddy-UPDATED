const required = [
  'MONGO_URI',
  'CLIENT_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

export default function validateEnv() {
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('❌ Missing env vars:', missing.join(', '));
    process.exit(1);
  }
}