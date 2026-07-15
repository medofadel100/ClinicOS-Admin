# ClinicOS License Verification Key

This is the **public** key that the future Windows desktop app will use to verify signed license payloads downloaded from `GET /api/v1/license/current` or manually activated via `POST /api/v1/license/activate`.

This file is safe to commit. The private key remains secure in the server's environment variables.

```pem
-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA9zvLDdwCW3mnDfOYiKDl9e7yfGO2lvoVQ22iPHFy934=
-----END PUBLIC KEY-----
```
