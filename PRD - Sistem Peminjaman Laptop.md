# **Product Requirements Document (PRD)**

**Nama Produk:** Sistem Peminjaman Laptop (SiPinjam Laptop)

**Platform:** Web Application (PWA Ready)

**Domain Target:** laptop.groyaquran.web.id

**Lingkungan Deployment:** Virtual Private Server (VPS) via Coolify

**Developer:** Muhammad Iqbal Putra

**Founder:** SistemFlow.com

## **1\. Ringkasan Eksekutif**

Sistem Peminjaman Laptop adalah aplikasi web internal sekolah yang dirancang untuk mendigitalisasi proses peminjaman inventaris, meningkatkan akuntabilitas, mencegah hilangnya jejak aset, dan memudahkan para guru dalam meminjam laptop. Aplikasi ini menggunakan sistem keamanan lapis ganda: akses PIN global untuk guru melihat ketersediaan dan meminjam, serta otentikasi Username/Password untuk Admin mengelola data. Sistem ini terintegrasi erat dengan WhatsApp melalui **n8n** untuk notifikasi dan persetujuan (approval) peminjaman secara *real-time*.

## **2\. Rekomendasi Tech Stack ("Vibe Coding" Stack)**

Untuk memenuhi kriteria mudah dikoding (vibe coding), PWA ready, aman, mudah diupgrade, dan cocok untuk VPS:

* **Frontend & Backend (Full-stack Framework):** **Next.js (App Router) \+ TypeScript.** Sangat disukai oleh AI coding assistant, cepat, dan modern.  
* **Styling:** **Tailwind CSS \+ Shadcn UI**. Untuk UI yang bersih, modern, dan komponen yang siap pakai tanpa konfigurasi css yang rumit.  
* **Database:** **SQLite**. Karena aplikasi ini merupakan aplikasi internal dengan traffic rendah dan jarang diakses secara bersamaan, SQLite adalah pilihan terbaik. Sangat ringan, *zero-config* (tidak perlu setup server database terpisah), dan hanya berupa file terpusat yang sangat mudah di-*backup*.  
* **ORM (Object-Relational Mapping):** **Prisma ORM** atau **Drizzle**. Memberikan tipe data yang ketat dan memudahkan migrasi database ke depannya.  
* **PWA:** Plugin next-pwa atau serwist untuk membuat aplikasi bisa diinstal di layar beranda HP guru.  
* **Deployment:** **Docker** \+ **Coolify** (diinstal di VPS). Coolify memberikan pengalaman *deploy* semudah Vercel tapi gratis di VPS sendiri.  
* **Integrasi:** API Routes bawaan Next.js untuk menerima/mengirim webhook ke **n8n**.

## **3\. Target Pengguna & Hak Akses**

1. **Guru (User Publik Internal):** Mengakses dengan PIN statis. Dapat melihat daftar laptop, status, dan mengajukan peminjaman.  
2. **Admin (Pengelola IT/Inventaris):** Mengakses dengan Username & Password. Mengelola master data, pengaturan sistem, dan menyetujui peminjaman via WhatsApp/n8n.

## **4\. Fitur Utama**

### **4.1. Halaman Publik & Peminjaman (Akses PIN)**

* **Gatekeeper PIN:** Halaman pertama yang meminta PIN. (PIN disimpan di *cookies/local storage* dengan spesifikasi batasan waktu/TTL misalnya 12-24 jam kedaluwarsa otomatis, guna mencegah penyalahgunaan jika perangkat yang sudah terbuka diakses oleh pihak tidak berkepentingan). Pada bagian bawah form PIN, terdapat informasi kredit aplikasi: **"Developer: Muhammad Iqbal Putra | Founder: SistemFlow.com"**.  
* **Tombol Panduan Peminjaman Interaktif:** Terdapat tombol bantuan/panduan di halaman PIN dan Dashboard yang jika diklik akan memunculkan *modal pop-up* atau *carousel/stepper* interaktif. Fitur ini menjelaskan alur visual langkah-demi-langkah (Login PIN ![][image1] Cek Ketersediaan ![][image1] Isi Form ![][image1] Tunggu Notifikasi WA Admin).  
* **Dashboard Status Laptop:**  
  * Menampilkan 3 kategori status/tab: **Tersedia**, **Dipinjam**, **Maintenance**.  
  * Kartu/List Laptop memuat: *Logo/Gambar asli laptop, Merk, Warna.*  
  * Jika status "Dipinjam", kartu juga menampilkan: *Nama Peminjam* dan *Tanggal Pinjam*.  
  * **Footer Informasi:** Di bagian paling bawah halaman dashboard (setelah list laptop), selalu menampilkan informasi footer konstan: **"Sistem Peminjaman Laptop \- Developer: Muhammad Iqbal Putra | Founder: SistemFlow.com"**.  
* **Formulir Pengajuan Peminjaman:**  
  * Form sederhana dengan *dropdown* pilihan Guru (data dari Admin), *dropdown* Laptop yang berstatus "Tersedia", serta field teks tambahan untuk "Tujuan Peminjaman" atau "Durasi Pinjam" guna memberikan konteks kepada Admin untuk memutuskan apakah pengajuan tersebut layak disetujui atau ditolak.  
  * Tombol "Ajukan Peminjaman".

### **4.2. Halaman Admin (Akses Username/Password)**

* **Autentikasi:** Halaman login khusus Admin (menggunakan NextAuth.js/Auth.js).  
* **Dashboard Overview:** Menampilkan statistik singkat (jumlah laptop tersedia, dipinjam, maintenance).  
* **Manajemen Data Guru (CRUD):**  
  * Input: Nama Guru, Jenis Kelamin, Divisi, No. HP (wajib untuk notifikasi WA).  
* **Manajemen Data Laptop (CRUD):**  
  * Input: Merk, Warna, Sumber Dana, Upload Logo/Foto Asli, Status Manual (Tersedia/Maintenance).  
* **Riwayat Peminjaman (Transaction History):**  
  * Menampilkan daftar seluruh transaksi yang sedang aktif (menunggu persetujuan, sedang dipinjam) maupun yang sudah selesai/ditolak.  
  * Admin wajib melakukan pengecekan fisik dan memverifikasi kondisi barang sebelum mengubah status secara manual menjadi Dikembalikan. Setelah diubah, status laptop otomatis akan kembali menjadi Tersedia di publik.  
* **Laporan (Reporting & Export):**  
  * Menampilkan data komprehensif seluruh peminjaman.  
  * Fitur Filter: Berdasarkan rentang tanggal (Date Range), Nama Guru, Merk/Unit Laptop, dan Status Peminjaman.  
  * Fitur **Download Excel (.xlsx)** dan **Download PDF** untuk kebutuhan arsip dan pelaporan inventaris sekolah.  
* **Menu Pengaturan (Settings):**  
  * Ubah PIN akses Guru.  
  * Ubah Username & Password Admin.  
  * Konfigurasi Webhook URL n8n (URL tujuan Next.js mengirim data saat ada pengajuan baru).  
  * Generate API Key rahasia (untuk autentikasi saat n8n mengirim balasan *approve/reject* ke aplikasi).

## **5\. Alur Pengguna (User Flow)**

### **5.1. Alur Peminjaman oleh Guru**

1. Guru membuka laptop.groyaquran.web.id dari HP/Laptop.  
2. Sistem meminta PIN. Guru memasukkan PIN (didapat dari deskripsi grup WA). *(Di tahap ini guru juga bisa mengklik tombol "Panduan Peminjaman" untuk melihat alur sistem).*  
3. Guru melihat Dashboard Utama (Daftar laptop Tersedia, Dipinjam, Maintenance).  
4. Guru memilih menu "Pinjam Laptop".  
5. Guru memilih namanya dari *dropdown* data Guru.  
6. Guru memilih laptop yang ingin dipinjam dari *dropdown* (hanya menampilkan laptop "Tersedia").  
7. Guru klik Ajukan Pinjam. Sistem web harus melakukan verifikasi ke database bahwa laptop masih benar-benar Tersedia. Sistem menggunakan mekanisme *database transaction (lock)* untuk mencegah bentrok apabila ada dua guru menekan tombol ajukan pada laptop yang sama di detik yang persis sama. Jika berhasil, peringatan Pengajuan sedang diproses Admin muncul.

### **5.2. Alur Approval via n8n (Backend Workflow)**

1. Setelah Guru klik "Ajukan", aplikasi web (*Next.js*) menyimpan data transaksi dengan status PENDING.  
2. Aplikasi web memicu/mengirim HTTP POST (Webhook) ke URL **n8n** yang diatur di menu Setting Admin. Payload berisi: Nama Guru, No HP Guru, Merk Laptop, ID Transaksi.  
3. **Di dalam n8n:**  
   * n8n menerima Webhook.  
   * n8n merakit pesan WhatsApp: "Ada pengajuan pinjam laptop ![][image2] dari ![][image3]."  
   * n8n membuat dua tautan (links) yang mengarah ke endpoint API aplikasi web:  
     * Link Approve: https://laptop.groyaquran.web.id/api/n8n/approve?id=\[ID\_TRANSAKSI\]\&token=\[API\_KEY\]  
     * Link Reject: https://laptop.groyaquran.web.id/api/n8n/reject?id=\[ID\_TRANSAKSI\]\&token=\[API\_KEY\] (bisa diarahkan ke form n8n sederhana untuk input alasan).  
   * n8n mengirim pesan WA tersebut ke nomor WhatsApp Admin.  
4. Admin menerima WA, lalu klik link **Approve** atau **Reject**.  
5. **Tindakan Admin:**  
   * **Jika Approve:** Endpoint API Next.js memperbarui status transaksi menjadi APPROVED, mengubah status laptop menjadi DIPINJAM. Next.js mengirim webhook kembali ke n8n agar n8n mengirim pesan WA ke Guru: "Pengajuan pinjam laptop ![][image2] DITERIMA. Silakan ambil."  
   * **Jika Reject:** Jika klik reject, n8n mengarahkan Admin ke web form sederhana (dibawaan n8n) untuk mengisi alasan penolakan. Setelah di-*submit*, n8n memberitahu Next.js untuk mengubah status jadi REJECTED, dan mengirim WA ke Guru: "Pengajuan DITOLAK. Alasan: ![][image4]".

## **6\. Desain Struktur Data (Skema Database Singkat)**

**1\. Table users (Admin)**

* id (UUID)  
* username (String)  
* password\_hash (String)

**2\. Table settings**

* key (String, PK) \- cth: global\_pin, n8n\_webhook\_url, n8n\_api\_key  
* value (String)

**3\. Table teachers (Guru)**

* id (UUID)  
* name (String)  
* gender (Enum: L/P)  
* division (String)  
* phone (String) \- *Format 628xxx*  
* is\_active (Boolean, default: true) \- *Untuk fitur Soft Delete jika guru mutasi atau resign*

**4\. Table laptops**

* id (UUID)  
* merk (String)  
* serial\_number (String, Unique) \- *Nomor seri/inventaris untuk membedakan unit secara fisik*  
* color (String)  
* funding\_source (String)  
* image\_url (String)  
* status (Enum: AVAILABLE, BORROWED, MAINTENANCE)

**5\. Table transactions**

* id (UUID)  
* teacher\_id (FK \-\> teachers)  
* laptop\_id (FK \-\> laptops)  
* borrow\_date (DateTime)  
* return\_date (DateTime, Nullable)  
* status (Enum: PENDING, APPROVED, REJECTED, RETURNED)  
* reject\_reason (String, Nullable)

## **7\. Keamanan dan Pengembangan Kedepan (Upgradability)**

* **Keamanan:**  
  * PIN di-*hash* atau divalidasi via *server-side* sebelum mengeset *secure HTTP-only cookie*, sehingga tidak bisa di-bypass lewat inspect element.  
  * Endpoint API (untuk ditekan oleh n8n) diamankan menggunakan Bearer Token / API Key yang diatur di setting Admin.  
  * Formulir dilindungi dari *CSRF (Cross-Site Request Forgery)* bawaan framework Next.js.  
* **Upgradability:**  
  * Penggunaan arsitektur React (Next.js) dan Tailwind membuat penambahan fitur (seperti laporan grafik bulanan, scanner QR Code di laptop, atau denda keterlambatan) sangat mudah ditambahkan menjadi komponen baru.  
  * Menjadi PWA berarti nantinya bisa dikembangkan fitur *Push Notification* tanpa perlu membuat aplikasi native Android/iOS.

## **8\. Panduan Deployment Khusus Coolify \+ SQLite**

Karena menggunakan SQLite dalam lingkungan Docker via Coolify, diperlukan konfigurasi **Persistent Storage** agar data tidak terhapus saat update (redeploy) aplikasi.

**Langkah-langkah Deployment:**

1. **Tambahkan Resource Baru:** Di dashboard Coolify, buat project baru dan sambungkan ke repository GitHub/GitLab Anda.  
2. **Build Pack (Nixpacks):** Gunakan bawaan Coolify yaitu Nixpacks. Ia akan secara otomatis mendeteksi project Next.js.  
3. **Environment Variables:** Setel di menu *Environment Variables* Coolify:  
   * NEXTAUTH\_URL=https://laptop.groyaquran.web.id  
   * NEXTAUTH\_SECRET=generate\_rahasia\_acak\_disini  
   * DATABASE\_URL="file:/app/data/sqlite.db" *(Path ini mengarah ke dalam folder khusus yang akan kita buat persisten)*  
4. **Konfigurasi Persistent Storage (SANGAT PENTING):**  
   * Masuk ke menu **Storages** di setting aplikasi pada Coolify.  
   * Tambahkan Volume mount baru.  
   * **Source (Host Path):** Kosongkan saja agar di-*manage* Coolify, ATAU isikan path VPS Anda (misal: /opt/coolify/data/sipinjam\_db).  
   * **Destination (Container Path):** /app/data  
5. **Post-Deploy Commands:**  
   * Di menu pengaturan Coolify (biasanya di bagian *Start Command* atau *Build Command* Nixpacks), pastikan proses *migration/push* database berjalan sebelum aplikasi hidup.  
   * Contoh custom build command: npm install && npx prisma db push && npm run build (Jika pakai Prisma).  
6. **Domain Binding:** Sambungkan domain laptop.groyaquran.web.id di pengaturan jaringan aplikasi Coolify agar SSL/TLS Let's Encrypt otomatis terbit.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAfElEQVR4XmNgGAWjgHpAAQjQxcgGQLM8lJSU+NHFyQIgg+Tl5YPQxckGQMMuKioqyqOLkwXExcW5gQYulpaWlkGRAApOA+JZpGI5ObkFQPoXEPehGEgqwOkycgDUddvRxckCQIOuUCUCgGHlAsSC6OJkAaCrWtHFRsFwAwB15R5PxjU85gAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAZCAYAAABzVH1EAAADMElEQVR4Xu1Wv2tUQRC+cBEiKioaT+/XXu7Awx9gcaAISixEsNAiCIInVoKNVQT9C2wsRIJlQKJoQO3OszFF0EYMaKONIJwiBAQRLAQNyfl92dmXubl3Z5GozftgeDsz3+zO252d91KpBAn+CdKVSmWHc24XpVQqDVmCRq1WWzcyMpIJfJgGLGcNMMC5C4XCfuRzyDpjgYBxSDsIAqcsRwOchuZDxixntSgWi2U1/4T19wVe4D2CHkDeZbPZ7dZPgFOC/xEXyOVyeetfS+BljmCdBcge6+sLBMxBLkLmuSPWDwxydyBNvsifSnC1QA7XuA6eW62vJ6rV6iYE1VH7ByT4lOXA3oB9H55LFOtfa2CNFnOx9r7g8YnwArch44bCy3dFuPS3jL8LvKh48TMYprUdm3UC9lrQuWnlcnm35hCyYV+DDs5mxqb6NRe3cqFYPkz0fvDl8/n10Kc5DpeQxx78BnzhRchcMGD8GnKdPpTjLTzTnN/5+p+EnIP8cL4DLoNlK3lMZDKZDVjvDmw7oT/pufbw8PBGEGaDLhNEOgLPQ78p4+MYL/EZ/AoDsF9l08DOuWB0/k5NYENy8L1iYtBnMH7OXcb4A9fUDYZcyaPu/MteBv+S2Gy1eMAx5jp3kORwpIOY4CwHsktMqhl30WG/LbGH8SIH+VIYv8HzQsqfxhBki9qMuIayDO668yfLPHqXkobznWhS6TzyBY5R56f5AeRYyoodLfZone96LLtPFIxvxJ2cJNmv67G8H0N+kgdpImavJXUBxBeQutK/cwL52j9T9pOSaFdyBHwf6bd2CybWjydl1WJOUoY8mUXL6wJIc0XVq6HPciFIgzWs7DO099pJJ7Vu7UxGfzydP/F5zdFw8qfBTwJ1rDcV5uXarJLOCA92GXaoqA6dP9Y2Ao4qHu3zcYkGwDcd54ftHuSu0tuQpuZohPWV/jDobOm4f5mITEUmjIRHSp90h7eBa3kiL6PJFBA7Ct8vuSOscc4TbRIvO2yLeB5bieoE/N8gn4PODsh5IF8gTzX3r8L5P+hRtnXrI6TMenYixJbA2aZtbDjy0ez4uCZIkCBBgv+C3/6eADu72RYxAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAZCAYAAADDq1t2AAAFnElEQVR4Xu1YTWhdVRB+j1RQVGzVNDY/b95L1CAUKsQfBH+6sFKpirQuCnUvQkGooNBFN8WVFKS4CoKClFLRhYtYFwGjKzWLVjF20bqoFAMtaTGYQi3J8/vumTmZe955tYiLq9wPhnvPnJlz5pwzM2fubTRq1KhR4/+Fdrt9q4hsMQJrIBEZmJiY2Jzw/mtoYp2vYX3TeJ5otVpvWAd4B7G+MSdbDcCwo6Cuo/2+v9PpbANvOZGZ9TJVBg5hB+w9A1rF+3d4ToNOgXZNTU3dguc8+JtSvcoABp4FfQtag1ftzPTPYQFvp/yqAmt4GPb+Crs/Gx0dvTvtB/+wOtm+tK9SgIEzWMzLauzxTP85LPTJlF9VwN4rXAujIu0jxsbGHkX/VaxpKu2rDIaHh++Fgc/yXQ+mm8qA9ykeG1J+1aDp6RPQNWz+U2m/QcKdeh6vzbSvMmAkINxH+C4hpXVxtwxZPwsEXp7rGr0YGRm5BzrPNXqLhwLsw0Y9Ym28TzBCObbxuKmw5RXM/5DxMmhCdxh6bb6nndDdDVqTEPV9HckdTAm082aiiDK63gIwZzvaT3sZAnIv/NPiYoNGQwEseivaVzDglzis28hjNDGq1lXWAdldoBUYdh/bkP2QBws6oCKsiN7DcwC8Y6CTaP9IvurzTvseel/jcEeV9w7HMRlFE/z9oI+HhoZuHx8fvwt63+hcz5sQ3q+R18/efsBa74feD4ODg3dIuE+LDELQccFbxHNc2zvoiBKcYBX0M/Qf4LrQ96LKvAr+LA8QzxVvD9cnf5eBqMCNcSwe1HFd4BNk4HmQfCcTISGXX7K2LuK6LYyRyPEZGeDPUB6e9ZjTXwF1udGOxwXPcZMcbw9o1ZfuaO8DLYmLMI5FamSi6UaAzvugw9x8CYcQD6YdSu1ZOgSaTXUa6hyQ4JSP4/kB5zU9rpmpVG2MjuL2wRw3D500RgzBTdIFXlBDz/l+A3T3SjiEWBRI8IYuDVAZpsGN7sAKr3PynMeX30UEcxzHM7lFxzK5o8bQRVMud0cydR2RUC5Hom3sZwQ0QlRzzKjPDUV7AZv8krIGKGt86VPV2bjoXwStGZ8Hx7ZdHX1BQ1qZMpjGkXSgU2l/Y31jFpIwpTf0bAznIF+9roDbyHgIeO9IcAifSjap3IzxMhtG0CbKrTheATjbgxKiYl5lVjH/55auDRIi8Lq1zaEkufdamqJSfgqda961S47bFxA64zfB8S9wAPR9hOextJ/FAfi/aF9MG6oXPcTxS55I0GvI85urUVgqPjrhI7crIaUWsHJXko1RubixKSgPWtJ01JPuVH/B2u2QUbqTk5N3ejnj02k8P4E5Soxq6eO4PaBg7vScR1zlJqT9olVNSy87x6chM0xZUvYUep1PRRZF6V1Cjy0OFnbtZJ/ZwqeTiwdNr7YNEnWoft8von86/FgGvfjZFzOIhHRl83h+EXnWzqGP3awYF3Wur7x8BMNYnBcmsCKglKoMrnqJB8NLncZKCFdeevHuUv6ctTWN0Xtydwk9tpifPI2sdIGshoqN8WPg/U0dY4/xPMD/jf05T2ea1T5/ANzIZd2rLxyfTrtk7Rw00r3drCxp2yyr33a56CoURAUi+arIoCXpjb5feFn+CboMOgvZZ/D8ScKmTZvXgr+RPDy3m6IavexTFgHeSdU/zRLW8d+VsEmXuSB+E+H9EsfAwt/yYzSCXb9LWNt5yJ/A8w/QRToE5A8l8hGtUO5znosS1vS6BHsYybtNTsc+4nVzEP1PJ+F/Iz98SdQ9zXNI5f81qOfHv9I8DN3sUv7Wb5TSdwl0265tKP5m51IRo1Srp2Iczs1DT8QKUF8Pzyow3kXZj98UHJMfwA2V57w+3RJY42TOxgzoJFvUbqLJ95vUrVGjRo0aNWrUqFGjRsBfEAzloufy/psAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,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>