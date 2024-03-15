# Skill Test Tavia Digital Solusi

Project ini digunakan untuk memenuhi skill-test dari PT Tavia Digital Solusi

Project ini dibangun dengan Express Typescript.
Tetap dapat dijalankan meskipun tidak menggunakan JavaScript (module).

## Documentation

Terdapat beberapa requirement pada project ini :

1. Sistem autentikasi dengan refresh token
2. Sistem register & forgot password dengan send email menggunakan mailtrap
3. Export/import CSV data.
4. Upload multiple file (Not handled perfectly)

## Konfigurasi

Untuk konfigurasi awal

1. Buat terlebih dahulu file .env. Copy file .env.example. Sesuaikan konfigurasi anda
2. Jalankan perintah berikut

```bash
    npm install
```

3. Migrasi & seeding kedatabase.

```bash
    npx sequelize-cli db:migrate
    npx sequelize-cli db:seed:all
```

4. Setelah proses selesai, jalankan project dengan

```bash
    npm start
```

## Tech Stack

**Server:** Node, Express, Typescript
**Database** mySQL
**Mail provider** mailtrap
