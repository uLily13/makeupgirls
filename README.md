# makeupgirls 💄

Монголын залуу охидод зориулсан орчин үеийн, цэвэрхэн гоо сайхны онлайн дэлгүүр.
Дизайн нь [cloudnine.mn](https://cloudnine.mn) болон [bbia.co.kr](https://www.bbia.co.kr)
загваруудаас санаа авсан — зөөлөн, гөлгөр, зочид охидод ээлтэй clean design.

## Технологи

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** — дизайн токенууд `src/app/globals.css`-д
- **Inter** + **Playfair Display** (Cyrillic subset) fonts
- **PostgreSQL** — өгөгдлийг JSONB document-оор хадгална (`src/lib/db.ts`)
- **Session auth** — scrypt hash + HMAC-гаар гарын үсэгтэй httpOnly cookie
- **Middleware host-routing** — `admin.*` subdomain → admin панель

## Тестерт: нэг командаар ажиллуулах (Docker)

[Docker Desktop](https://www.docker.com/products/docker-desktop/) суулгаад ажиллуулж
байгаа эсэхээ шалгаад, дараах **нэг командыг** ажлуулна:

```bash
git clone https://github.com/uLily13/makeupgirls.git && cd makeupgirls && docker compose up --build
```

Postgres + апп хамт босч, өгөгдөл автоматаар seed хийгдэнэ. Дараа нь нээнэ:

- **Дэлгүүр:** http://localhost:3000
- **Админ:** http://localhost:3000/admin — `admin@makeupgirls.mn` / `admin1234`

Зогсоохдоо терминал дээр `Ctrl+C`. Дахин цэвэрээс эхлэх бол `docker compose down -v`.

## Ажиллуулах (local, Docker-гүй)

1. **PostgreSQL** суулгаж, DB үүсгэнэ:
   ```bash
   createdb makeupgirls
   ```
2. Орчны хувьсагч тохируулна:
   ```bash
   cp .env.example .env.local   # доторх утгуудыг өөрийнхөөрөө засна
   ```
3. Ажиллуулна (DB эхний ачаалалд seed-ээс автоматаар дүүрнэ):
   ```bash
   npm install
   npm run dev      # http://localhost:3000
   ```

- **Storefront:** http://localhost:3000
- **Admin:** http://localhost:3000/admin эсвэл http://admin.localhost:3000
  (`.env.local`-ийн `ADMIN_EMAIL` / `ADMIN_PASSWORD`-оор нэвтэрнэ)

## Бүтэц

```
src/
├─ app/
│  ├─ layout.tsx            # fonts, header, footer, cart provider
│  ├─ page.tsx              # Нүүр — hero, ангилал, хит, шинэ, value props
│  ├─ shop/                 # Дэлгүүр — ангилал шүүлт + эрэмбэлэлт
│  ├─ product/[slug]/       # Бүтээгдэхүүний дэлгэрэнгүй + сагслах
│  └─ cart/                 # Сагс / захиалгын хуудас
│  └─ admin/                # 🔐 Админ удирдлага (доор үзнэ үү)
├─ components/              # Header, Footer, CartDrawer, ProductCard, Hero…
└─ lib/
   ├─ products.ts           # Төрөл + seed өгөгдөл (анхны утга) + MNT
   ├─ content.ts            # Засварлаж болох текстийн бүртгэл (seed)
   ├─ db.ts                 # JSON-file store (getStore/saveStore) — server-only
   └─ cart.tsx              # Сагсны context
```

## Админ удирдлага (`/admin`)

Customer UI-д харагдах бүхнийг удирдана. Өгөгдөл `data/store.json`-д хадгалагдаж
(JSON store), бүх дэлгүүрийн хуудас үүнээс уншина. Server Actions-аар засна.

- **/admin** — хяналтын самбар (статистик, сүүлийн үнийн өөрчлөлт)
- **/admin/products** — бүтээгдэхүүн нэмэх/засах/устгах/нуух; **үнэ солих бүрд
  хуучин үнэ `priceHistory`-д хадгалагдана**; **урамшуулал** зарлах/зогсоох
- **/admin/menu** — ангилал ба дэд ангилал нэмэх/засах/нуух/харуулах/устгах
- **/admin/content** — сайтын текст засах; **өөрчлөх бүрд хуучин хувилбар
  `history`-д хадгалагдаж, сэргээх боломжтой**
- **/admin/reports** — идэвхтэй урамшуулал + үнийн өөрчлөлтийн бүрэн түүх

`data/store.json` байхгүй бол `products.ts` + `content.ts` seed-ээс автоматаар
үүснэ (устгавал дахин seed болно). Шинэ текстийг засварлагдах болгохын тулд
`content.ts`-д key нэмээд, компонентдоо `content["key"]` гэж дуудна.

**Нэвтрэлт:** `/admin` бол зөвхөн `role: "admin"` эрхтэй хэрэглэгч нэвтэрнэ
([/admin/login](src/app/admin/login)). Эхний админ нь `ADMIN_EMAIL` /
`ADMIN_PASSWORD` env-ээс DB seed хийхэд автоматаар үүснэ.

**Subdomain:** `middleware.ts` нь `admin.*` host-ыг `/admin` руу чиглүүлдэг тул
admin панель `admin.makeupgirls.mn` дээр ажиллана (нэг codebase). Local дээр
`admin.localhost:3000`-оор турших боломжтой.

## Хэрэглэгчийн бүртгэл (Authentication)

Session-д суурилсан нэвтрэлт — гадаад сангүй. Нууц үг `scrypt`-ээр hash хийгдэж,
session нь **гарын үсэгтэй (HMAC) httpOnly cookie**-д хадгалагдана. Логик:
[auth.ts](src/lib/auth.ts).

- **/register**, **/login** — бүртгүүлэх / нэвтрэх (нэвтрэнгүүт auto-login)
- **/account** — миний бүртгэл (хяналт)
  - **/account/orders** — өмнө авсан бараа (захиалгын түүх)
  - **/account/addresses** — хүргэлтийн хаяг (нэмэх/засах/устгах, үндсэн хаяг)
  - **/account/profile** — өөрийн мэдээлэл (нэр, утас)
- **Checkout:** сагснаас `Худалдан авах` → нэвтрээгүй бол `/login` руу → хаягаа
  сонгож захиалга үүснэ. Захиалгын үнэ нь **серверийн одоогийн үнээр** тооцогдоно
  (client-ийн үнэд итгэхгүй), сагс цэвэрлэгдэж, түүхэнд харагдана.

> ⚠️ Production-д гаргахаас өмнө `SESSION_SECRET`-ийг env хувьсагч болгож,
> HTTPS дээр ажиллуулна уу (cookie аль хэдийн httpOnly + sameSite=lax).

## Deploy хийх (Vercel + hosted Postgres)

1. **Postgres** үүсгэх — [Neon](https://neon.tech), [Supabase](https://supabase.com)
   эсвэл Vercel Postgres. **Pooled** connection string ашиглана
   (`...?sslmode=require`). Serverless дээр pooler чухал.
2. **GitHub** руу push (доор үзнэ үү).
3. **Vercel** дээр repo-г import хийж, дараах env-үүдийг оруулна:
   - `DATABASE_URL` — hosted Postgres-ийн pooled URL
   - `SESSION_SECRET` — урт random мөр (`openssl rand -hex 32`)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — эхний админ
4. **Домэйн:** Vercel project дээр `makeupgirls.mn` **ба** `admin.makeupgirls.mn`
   хоёуланг нэмнэ. DNS дээр `admin` → Vercel руу CNAME. `middleware.ts` нь
   admin subdomain-ыг өөрөө таньж, `/admin` руу чиглүүлнэ.
5. Эхний ачаалалд DB хоосон бол seed-ээс автоматаар дүүрч, админ үүснэ.

> Одоогийн store нь нэг JSONB document. Ирээдүйд хэвийн (normalized) хүснэгт рүү
> задлахад `getStore/saveStore`-ын дотор талыг л өөрчилнө — бусад код хэвээрээ.

**Зураг:** админаас **файл шууд upload** хийнэ. Зураг Postgres-ийн `assets`
хүснэгтэд (bytea) хадгалагдаж, `/api/image/<id>`-ээр serve хийгдэнэ — гадаад
сервис шаардахгүй, local болон deploy хоёуланд ажиллана. Их хэмжээний трафикт
Cloudinary / S3 / Vercel Blob руу шилжүүлж болно (upload route-ыг л өөрчилнө).

## Дараагийн алхам

- **Төлбөр:** захиалгад QPay / банкны интеграц холбох.
- **Захиалгын удирдлага:** admin дээр захиалгын статус солих (Хүргэгдсэн г.м.).
- **Store normalization:** JSONB → relational хүснэгтүүд (том масштабт).
