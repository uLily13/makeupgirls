export type Category = {
  slug: string;
  name: string;
  tagline: string;
  accent: string; // distinct swatch color for the category
  hidden?: boolean; // hidden from the customer storefront
};

export type Subcategory = {
  slug: string;
  name: string;
  category: string; // parent category slug
  hidden?: boolean;
};

// A single logged price change — kept for reports even after further changes.
export type PriceChange = {
  at: string; // ISO timestamp
  from: number | null; // previous price (null = first set)
  to: number; // new price
  note?: string; // e.g. "Урамшуулал", "Үнэ шинэчлэл"
};

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: string; // category slug
  subcategory: string; // subcategory slug
  price: number; // MNT — current selling price
  oldPrice?: number; // compare-at (strikethrough) price when on promotion
  rating: number;
  reviews: number;
  shade: string; // primary swatch color
  shades?: string[];
  badge?: "Шинэ" | "Хит" | "Хямдрал";
  short: string;
  description: string;
  ingredients: string[];
  hidden?: boolean; // hidden from the customer storefront
  priceHistory?: PriceChange[]; // full price change log for reports
};

// Editable site text — every value keeps its previous versions.
export type ContentItem = {
  key: string;
  group: string; // admin grouping label
  label: string; // human label in admin
  value: string;
  multiline?: boolean;
  history?: { value: string; at: string }[];
};

// -------- Accounts, addresses & orders --------

export type Address = {
  id: string;
  label: string; // "Гэр", "Ажил", ...
  recipient: string;
  phone: string;
  city: string; // аймаг / хот
  district: string; // дүүрэг / сум
  khoroo: string; // хороо / баг
  detail: string; // байр, орц, тоот
  isDefault?: boolean;
};

export type Role = "admin" | "customer";

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  passwordHash: string;
  salt: string;
  addresses: Address[];
  createdAt: string;
};

// User with secrets stripped — safe to pass to the client.
export type SafeUser = Omit<User, "passwordHash" | "salt">;

export type OrderItem = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
  shade: string;
};

export type OrderStatus = "Хүлээгдэж буй" | "Хүргэгдсэн" | "Цуцлагдсан";

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: Address | null;
  status: OrderStatus;
  createdAt: string;
};

export type Store = {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  content: ContentItem[];
  users: User[];
  orders: Order[];
  updatedAt: string;
};

export const categories: Category[] = [
  { slug: "lips", name: "Уруул", tagline: "Тани, гялбаа, шингэн будаг", accent: "#d1707a" },
  { slug: "eyes", name: "Нүд", tagline: "Сүүдэр, шаглагч, палетка", accent: "#a6836a" },
  { slug: "face", name: "Нүүр", tagline: "Суурь, консилер, пудр", accent: "#e0b48f" },
  { slug: "cheek", name: "Хацар", tagline: "Улайлга, хайлайтер", accent: "#e693a0" },
  { slug: "skincare", name: "Арьс арчилгаа", tagline: "Чийгшүүлэгч, серум", accent: "#8fc9b4" },
  { slug: "sets", name: "Багц", tagline: "Бэлдэц, бэлгийн багц", accent: "#c9a96a" },
];

// Sub-categories grouped under each top category.
export const subcategories: Subcategory[] = [
  // Уруул
  { slug: "lip-color", name: "Уруул өнгөлөгч", category: "lips" },
  { slug: "lip-gloss", name: "Уруулын гялбаа", category: "lips" },
  { slug: "lip-tint", name: "Уруулын тинт", category: "lips" },
  { slug: "lip-balm", name: "Уруулын балм", category: "lips" },
  { slug: "lip-liner", name: "Уруул хүрээлэгч", category: "lips" },
  // Нүд
  { slug: "eyeshadow", name: "Нүдний сүүдэр", category: "eyes" },
  { slug: "mascara", name: "Сормуусны будаг", category: "eyes" },
  { slug: "eyeliner", name: "Нүдний шугам", category: "eyes" },
  { slug: "brow", name: "Хөмсөгний будаг", category: "eyes" },
  // Нүүр
  { slug: "primer", name: "Праймер", category: "face" },
  { slug: "foundation", name: "Шингэн суурь", category: "face" },
  { slug: "cushion", name: "Кюшион", category: "face" },
  { slug: "concealer", name: "Өө дарагч", category: "face" },
  { slug: "powder", name: "Пудр", category: "face" },
  // Хацар
  { slug: "blush", name: "Улайлга", category: "cheek" },
  { slug: "highlighter", name: "Хайлайтер", category: "cheek" },
  { slug: "contour", name: "Контур", category: "cheek" },
  // Арьс арчилгаа
  { slug: "cleanser", name: "Цэвэрлэгч", category: "skincare" },
  { slug: "toner", name: "Тонер", category: "skincare" },
  { slug: "serum", name: "Серум", category: "skincare" },
  { slug: "moisturizer", name: "Чийгшүүлэгч", category: "skincare" },
  { slug: "sunscreen", name: "Нарны тос", category: "skincare" },
  // Багц
  { slug: "daily-set", name: "Өдөр тутмын багц", category: "sets" },
  { slug: "gift-set", name: "Бэлгийн багц", category: "sets" },
];

export const MNT = (n: number) =>
  new Intl.NumberFormat("mn-MN").format(n) + "₮";

// Soft placeholder gradients per category — used when no image asset present.
export const products: Product[] = [
  {
    slug: "velvet-blur-lip-tint",
    subcategory: "lip-tint",
    name: "Velvet Blur уруулын тани",
    brand: "GLOW LAB",
    category: "lips",
    price: 42000,
    oldPrice: 52000,
    rating: 4.9,
    reviews: 214,
    shade: "#c65b63",
    shades: ["#c65b63", "#a8434f", "#d67f7f", "#8f3a44"],
    badge: "Хит",
    short: "Хөнгөн, матт өнгөлөлттэй, өдөржин тогтвортой уруулын тани.",
    description:
      "Нэг түрхэлтээр жигд, матт өнгө өгөх хөнгөн уруулын тани. Уруулыг хатаалгүй, амьсгалуулж, 8 цаг хүртэл тогтвортой байна. Солонгосын гоо сайхны технологиор бүтээгдсэн.",
    ingredients: ["Витамин Е", "Жожоба тос", "Гиалуроны хүчил"],
  },
  {
    slug: "dewy-glass-lip-gloss",
    subcategory: "lip-gloss",
    name: "Dewy Glass гялбаа",
    brand: "GLOW LAB",
    category: "lips",
    price: 38000,
    rating: 4.8,
    reviews: 156,
    shade: "#e29aa1",
    shades: ["#e29aa1", "#f0b8bd", "#cf7d86"],
    badge: "Шинэ",
    short: "Толь мэт гялалзсан, наалдамхай биш шингэн гялбаа.",
    description:
      "Уруулыг шилэн мэт гялалзуулж, дүүрэн харагдуулна. Наалдамхай мэдрэмжгүй, зөөлөн бүтэцтэй.",
    ingredients: ["Ургамлын коллаген", "Кокосын тос"],
  },
  {
    slug: "soft-matte-palette",
    subcategory: "eyeshadow",
    name: "Soft Matte нүдний палетка",
    brand: "AURORE",
    category: "eyes",
    price: 89000,
    oldPrice: 110000,
    rating: 4.9,
    reviews: 302,
    shade: "#b98a6d",
    badge: "Хямдрал",
    short: "12 өнгийн нейтрал, өдөр тутмын палетка.",
    description:
      "Матт болон гялалзсан 12 өнгийн зохицол. Нунтаглалт багатай, өнгө сайтай суудаг. Өдөр тутмын болон үдшийн лук аль алинд тохирно.",
    ingredients: ["Эрдэс пигмент", "Ши тос"],
  },
  {
    slug: "lash-lift-mascara",
    subcategory: "mascara",
    name: "Lash Lift сормуусны будаг",
    brand: "AURORE",
    category: "eyes",
    price: 46000,
    rating: 4.7,
    reviews: 189,
    shade: "#2b2622",
    badge: "Хит",
    short: "Сормуусыг сунгаж, өргөж, бөөгнөрөлгүй.",
    description:
      "Сормуусыг үндэснээс нь өргөж, эрчимтэй хар өнгө өгнө. Ус тэсвэртэй, өдөржин урсахгүй.",
    ingredients: ["Кератин", "Пантенол"],
  },
  {
    slug: "second-skin-foundation",
    subcategory: "foundation",
    name: "Second Skin суурь",
    brand: "MAISON DE PEAU",
    category: "face",
    price: 98000,
    rating: 4.8,
    reviews: 267,
    shade: "#e7c4a6",
    shades: ["#f0d3ba", "#e7c4a6", "#d3a883", "#b98461"],
    badge: "Хит",
    short: "Арьс мэт зөөлөн, дунд зэргийн бүрхэлттэй шингэн суурь.",
    description:
      "Арьсанд жин нэмэхгүй, амьсгалуулж, байгалийн гөлгөр өнгөлөлт өгнө. SPF 30 хамгаалалттай.",
    ingredients: ["SPF 30", "Ниацинамид", "Гиалуроны хүчил"],
  },
  {
    slug: "blur-cushion",
    subcategory: "cushion",
    name: "Blur Cushion кушон",
    brand: "MAISON DE PEAU",
    category: "face",
    price: 76000,
    oldPrice: 88000,
    rating: 4.9,
    reviews: 341,
    shade: "#eccbb0",
    badge: "Шинэ",
    short: "Нэг товшилтоор жигд, чийглэг өнгөлөлт.",
    description:
      "Зөөвөрлөхөд хялбар кушон суурь. Нүх сүвийг нууж, гэрэлтсэн арьсны эффект өгнө.",
    ingredients: ["Ногоон цайн ханд", "Пептид"],
  },
  {
    slug: "cloud-blush",
    subcategory: "blush",
    name: "Cloud улайлга",
    brand: "AURORE",
    category: "cheek",
    price: 39000,
    rating: 4.9,
    reviews: 220,
    shade: "#e69ba0",
    shades: ["#e69ba0", "#d97f86", "#f0b0b4", "#c76d78"],
    badge: "Хит",
    short: "Үүл мэт зөөлөн, зулгаалттай крем улайлга.",
    description:
      "Хацарт байгалийн ягаан өнгө нэмнэ. Крем бүтэцтэй, арьсанд амархан шингэж, шинэлэг харагдуулна.",
    ingredients: ["Гиалуроны хүчил", "Витамин Е"],
  },
  {
    slug: "liquid-highlighter",
    subcategory: "highlighter",
    name: "Liquid Glow хайлайтер",
    brand: "GLOW LAB",
    category: "cheek",
    price: 44000,
    rating: 4.7,
    reviews: 143,
    shade: "#f0d9b8",
    badge: "Шинэ",
    short: "Шүүдэр мэт шингэн гэрэлтүүлэгч.",
    description:
      "Арьсанд дотоод гэрэлтэлт нэмнэ. Дангаар нь эсвэл суурьтай хольж хэрэглэж болно.",
    ingredients: ["Сувдан пигмент", "Скваллан"],
  },
  {
    slug: "hydra-serum",
    subcategory: "serum",
    name: "Hydra Boost серум",
    brand: "MAISON DE PEAU",
    category: "skincare",
    price: 68000,
    oldPrice: 82000,
    rating: 4.9,
    reviews: 398,
    shade: "#cfe6dc",
    badge: "Хямдрал",
    short: "Гиалуроны хүчлээр гүн чийгшүүлэгч серум.",
    description:
      "Арьсны чийгийн түвшинг сэргээж, зөөлөн, гялалзсан харагдуулна. Бүх төрлийн арьсанд тохирно.",
    ingredients: ["5 төрлийн гиалуроны хүчил", "Пантенол", "Мадекассосид"],
  },
  {
    slug: "barrier-cream",
    subcategory: "moisturizer",
    name: "Barrier чийгшүүлэгч",
    brand: "MAISON DE PEAU",
    category: "skincare",
    price: 58000,
    rating: 4.8,
    reviews: 276,
    shade: "#f3e3d0",
    badge: "Хит",
    short: "Арьсны хамгаалалтын давхаргыг сэргээх крем.",
    description:
      "Хуурайшилт, улайлтыг намдааж, арьсны саадыг бэхжүүлнэ. Өдөр, шөнө хэрэглэнэ.",
    ingredients: ["Церамид", "Ниацинамид", "Ши тос"],
  },
  {
    slug: "everyday-glow-set",
    subcategory: "daily-set",
    name: "Everyday Glow багц",
    brand: "GLOW LAB",
    category: "sets",
    price: 149000,
    oldPrice: 186000,
    rating: 5.0,
    reviews: 121,
    shade: "#e7b6b0",
    badge: "Хямдрал",
    short: "Өдөр тутмын лукийн 4 бүтээгдэхүүний багц.",
    description:
      "Суурь, улайлга, уруулын тани, хайлайтер — өдөр тутмын гэрэлтсэн лукийг нэг багцаас. Бэлэгт тохиромжтой.",
    ingredients: ["4 бүтээгдэхүүн", "Бэлгийн хайрцаг"],
  },
  {
    slug: "date-night-set",
    subcategory: "gift-set",
    name: "Date Night багц",
    brand: "AURORE",
    category: "sets",
    price: 168000,
    rating: 4.9,
    reviews: 88,
    shade: "#c98088",
    badge: "Шинэ",
    short: "Үдшийн гоо сайхны бүрэн багц.",
    description:
      "Нүдний палетка, сормуусны будаг, эрч хүчтэй уруулын тани багтсан үдшийн лукийн багц.",
    ingredients: ["3 бүтээгдэхүүн", "Бэлгийн хайрцаг"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategory(slug: string) {
  return subcategories.find((s) => s.slug === slug);
}

export function subcategoriesByCategory(catSlug: string) {
  return subcategories.filter((s) => s.category === catSlug);
}

export function productsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}

// Count of in-stock products per subcategory (0 = coming soon).
export function countBySubcategory(subSlug: string) {
  return products.filter((p) => p.subcategory === subSlug).length;
}
