const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

console.log("=== PRIVATE KEY (Save to .env.local as LICENSE_PRIVATE_KEY) ===");
console.log(privateKey.export({ type: 'pkcs8', format: 'pem' }).toString());

console.log("\n=== PUBLIC KEY (Save to LICENSE_PUBLIC_KEY.md) ===");
console.log(publicKey.export({ type: 'spki', format: 'pem' }).toString());
