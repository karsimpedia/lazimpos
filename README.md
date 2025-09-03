# POS Kasir Starter (Frontend Next.js + Backend Express)

> Hybrid: **Digital** via server pulsa (pass-through), **Fisik** via DB lokal (Prisma).

## Struktur
```
pos-kasir-starter/
  backend/      # Express + Prisma + Redis/BullMQ-ready
  frontend/     # Next.js (App Router)
  docker-compose.yml
  README.md
```

## Jalankan (development)
1. Copy `.env.example` → `.env` di `backend/` dan sesuaikan.
2. Jalankan services dev:
   ```bash
   docker compose up -d postgres redis
   ```
3. Install & migrate backend:
   ```bash
   cd backend
   npm i
   npx prisma migrate dev --name init
   npm run dev
   ```
   Backend akan jalan di `http://localhost:3001`.
4. Jalankan frontend:
   ```bash
   cd ../frontend
   npm i
   npm run dev
   ```
   Frontend akan jalan di `http://localhost:3000`.

### ENV Penting (backend/.env)
- **Pulsa server** (ambil katalog, buat transaksi, callback HMAC):
  - `PULSA_BASE_URL`, `PULSA_PRODUCTS_PATH`, `PULSA_TRX_PATH`, `PULSA_BALANCE_PATH`
  - `PULSA_MEMBER_ID`, `PULSA_PIN`, `PULSA_PASSWORD`, `PULSA_SECRET`
  - `PULSA_SIGN_TEMPLATE`, `PULSA_SIGN_ALGO` (produk)
  - `PULSA_TRX_SIGN_TPL`, `PULSA_TRX_SIGN_ALGO` (transaksi)
  - `PULSA_CALLBACK_HMAC_SECRET` (verifikasi callback)

### Catatan
- Ini starter minimal. Tambahkan auth, role, rate limit, dan production hardening sesuai kebutuhan.
- Worker BullMQ sudah disiapkan secara minimal; aktifkan kalau perlu antrean.
# lazimpos
