# 🛠️ Panduan Maintenance & Troubleshooting

## 🚨 Jika Sistem Tiba-tiba Tidak Berfungsi

### Quick Fix (Perbaikan Cepat)
```bash
# 1. Jalankan emergency fix
node emergency-fix.js

# 2. Restart server
npm run dev

# 3. Test login
node test-login.js
```

### Health Check Harian
```bash
# Jalankan setiap hari untuk memastikan sistem sehat
node system-health-check.js
```

### Backup Otomatis
```bash
# Backup database dan file penting
node auto-backup.js
```

## 🔍 Troubleshooting Umum

### 1. Login Tidak Berfungsi

**Gejala:** User login tapi langsung redirect kembali ke login

**Penyebab Umum:**
- SystemUser model hilang dari database
- JWT_SECRET tidak ada di .env
- AuthProvider tidak terintegrasi dengan benar

**Solusi:**
```bash
# Check database
node debug-db.js

# Fix otomatis
node emergency-fix.js

# Test manual
http://localhost:3000/test-flow
```

### 2. Database Error

**Gejala:** Prisma client error, table tidak ditemukan

**Solusi:**
```bash
# Reset dan recreate database
npx prisma migrate reset --force
npx prisma migrate dev --name fix-database
node create-demo-users.js
```

### 3. Environment Variables Hilang

**Gejala:** JWT error, API tidak berfungsi

**Solusi:**
```bash
# Check .env file
cat .env

# Recreate jika hilang
node emergency-fix.js
```

### 4. Server Tidak Start

**Gejala:** npm run dev gagal

**Solusi:**
```bash
# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Start server
npm run dev
```

## 📋 Checklist Maintenance Mingguan

### Senin - Health Check
- [ ] Jalankan `node system-health-check.js`
- [ ] Check semua API endpoints
- [ ] Verify demo users masih ada
- [ ] Test login dari browser

### Rabu - Backup
- [ ] Jalankan `node auto-backup.js`
- [ ] Verify backup files tersimpan
- [ ] Test restore script jika perlu

### Jumat - Update Check
- [ ] Check git status
- [ ] Commit perubahan penting
- [ ] Update dependencies jika perlu
- [ ] Test semua fitur utama

## 🔧 Script Maintenance

### 1. system-health-check.js
**Fungsi:** Monitor kesehatan sistem
**Kapan:** Setiap hari
**Output:** Health report JSON

### 2. auto-backup.js
**Fungsi:** Backup database dan file penting
**Kapan:** Setiap hari/minggu
**Output:** Backup files + restore script

### 3. emergency-fix.js
**Fungsi:** Perbaiki masalah umum otomatis
**Kapan:** Saat ada masalah
**Output:** Fix report

### 4. debug-db.js
**Fungsi:** Debug database dan user setup
**Kapan:** Saat troubleshooting
**Output:** Database status

### 5. test-login.js
**Fungsi:** Test API login
**Kapan:** Saat troubleshooting
**Output:** Login test result

## 🚨 Emergency Procedures

### Jika Sistem Benar-benar Rusak

1. **Stop Panic** - Tenang, ada backup dan script recovery
2. **Run Emergency Fix:**
   ```bash
   node emergency-fix.js
   ```
3. **Check Backup:**
   ```bash
   ls backups/
   ```
4. **Restore dari Backup (jika perlu):**
   ```bash
   cd backups/
   node restore-YYYY-MM-DD.js
   ```
5. **Restart Everything:**
   ```bash
   npm run dev
   ```

### Jika Database Corrupt

1. **Backup Current State:**
   ```bash
   node auto-backup.js
   ```
2. **Reset Database:**
   ```bash
   npx prisma migrate reset --force
   ```
3. **Recreate Users:**
   ```bash
   node create-demo-users.js
   ```

### Jika File Hilang

1. **Check Git Status:**
   ```bash
   git status
   git log --oneline -10
   ```
2. **Restore dari Git:**
   ```bash
   git checkout HEAD -- src/components/AuthProvider.tsx
   git checkout HEAD -- src/app/api/auth/login/route.ts
   ```
3. **Atau Restore dari Backup:**
   ```bash
   # Copy dari folder backups/files-YYYY-MM-DD/
   ```

## 📊 Monitoring

### Log Files yang Perlu Diwatch
- `health-report-*.json` - Daily health reports
- `emergency-fix-report-*.json` - Emergency fix logs
- Server console logs
- Browser console errors

### Key Metrics
- User count in database (should be 4+)
- API response time
- Login success rate
- File integrity

## 🔒 Security Checklist

### Environment Variables
- [ ] JWT_SECRET tidak kosong
- [ ] DATABASE_URL aman
- [ ] Instagram tokens valid
- [ ] .env tidak di-commit ke git

### Database
- [ ] Demo passwords di-hash dengan bcrypt
- [ ] User roles terdefinisi dengan benar
- [ ] Tidak ada SQL injection vulnerability

### Files
- [ ] Backup terenkripsi (jika perlu)
- [ ] File permissions correct
- [ ] Tidak ada hardcoded secrets

## 📞 Kontak Darurat

Jika semua script gagal dan sistem masih bermasalah:

1. **Check Documentation:** README.md
2. **Check Git History:** `git log --oneline`
3. **Check Backup:** folder `backups/`
4. **Recreate dari Scratch:** Gunakan backup terakhir yang working

## 🎯 Prevention Tips

1. **Commit Sering:** Setiap perubahan penting
2. **Backup Rutin:** Minimal seminggu sekali
3. **Test Sebelum Deploy:** Selalu test di local
4. **Monitor Health:** Jalankan health check rutin
5. **Document Changes:** Catat setiap perubahan penting

---

**Remember:** Sistem ini sudah dilengkapi dengan script recovery otomatis. Jangan panik, ikuti prosedur step by step!
