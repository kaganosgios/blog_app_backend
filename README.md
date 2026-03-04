# Multi User Blog API

Node.js, Express.js, MongoDB ve JWT kullanilarak gelistirilmis cok kullanicili blog platformu REST API projesi.

## Ozellikler
- Kullanici kaydi ve girisi
- JWT tabanli kimlik dogrulama
- Profil goruntuleme ve guncelleme
- Avatar ve blog gorseli yukleme
- Blog yazisi olusturma, listeleme, guncelleme ve silme
- Yorum ekleme, cevap verme, guncelleme ve silme
- Yazi begenme / begendigi geri alma
- Arama, etiket, yazar, tarih ve populerlik bazli filtreleme

## Kurulum
```bash
npm install
cp .env.example .env
```



## Calistirma
```bash
npm run dev
```

## Endpointler

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Users
- `GET /api/users/me`
- `PUT /api/users/me`

### Posts
- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/like`
- `POST /api/posts/:postId/comments`

### Comments
- `PUT /api/comments/:id`
- `DELETE /api/comments/:id`

## Ornek filtreleme
- `GET /api/posts?q=node`
- `GET /api/posts?tag=backend,express`
- `GET /api/posts?author=John`
- `GET /api/posts?sort=popular`
- `GET /api/posts?fromDate=2026-01-01&toDate=2026-12-31`


