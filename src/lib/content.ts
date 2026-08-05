import type { ContentItem } from "./products";

// Registry of every editable piece of marketing text on the storefront.
// `value` is the current default; the admin can change it and each change
// is versioned in `history`. To make a new string editable, add a key here
// and reference it via the content map in the component.
export const seedContent: Omit<ContentItem, "history">[] = [
  // Зарлалын мөр
  { key: "announce.1", group: "Зарлалын мөр", label: "Мессеж 1", value: "100,000₮-с дээш захиалгад үнэгүй хүргэлт" },
  { key: "announce.2", group: "Зарлалын мөр", label: "Мессеж 2", value: "Улаанбаатар хотод 24 цагийн дотор хүргэнэ" },
  { key: "announce.3", group: "Зарлалын мөр", label: "Мессеж 3", value: "Шинэ хэрэглэгчид -10% хямдрал" },
  { key: "announce.4", group: "Зарлалын мөр", label: "Мессеж 4", value: "100% жинхэнэ бүтээгдэхүүн" },

  // Hero — слайдуудыг «Hero баннер» админ хэсгээс удирдана. Энд зөвхөн товчнууд.
  { key: "hero.cta1", group: "Нүүр — Hero", label: "Товч 1", value: "Одоо худалдаж авах" },
  { key: "hero.cta2", group: "Нүүр — Hero", label: "Товч 2", value: "Багц үзэх" },

  // Home sections
  { key: "home.faves.eyebrow", group: "Нүүр — Хэсгүүд", label: "Онцлох — жижиг гарчиг", value: "Онцлох" },
  { key: "home.faves.title", group: "Нүүр — Хэсгүүд", label: "Онцлох — гарчиг", value: "Онцлох бүтээгдэхүүн" },
  { key: "home.faves.tab1", group: "Нүүр — Хэсгүүд", label: "Таб 1 — нэр", value: "Хит бүтээгдэхүүн" },
  { key: "home.faves.tab2", group: "Нүүр — Хэсгүүд", label: "Таб 2 — нэр", value: "Багц" },
  { key: "home.cat.eyebrow", group: "Нүүр — Хэсгүүд", label: "Ангилал — жижиг гарчиг", value: "Ангилал" },
  { key: "home.cat.title", group: "Нүүр — Хэсгүүд", label: "Ангилал — гарчиг", value: "Юу хайж байна?" },
  { key: "home.best.eyebrow", group: "Нүүр — Хэсгүүд", label: "Хит — жижиг гарчиг", value: "Хамгийн их зарагдсан" },
  { key: "home.best.title", group: "Нүүр — Хэсгүүд", label: "Хит — гарчиг", value: "Хит бүтээгдэхүүн" },
  { key: "home.new.eyebrow", group: "Нүүр — Хэсгүүд", label: "Шинэ — жижиг гарчиг", value: "Шинээр ирсэн" },
  { key: "home.new.title", group: "Нүүр — Хэсгүүд", label: "Шинэ — гарчиг", value: "Шинэ цуглуулга" },

  // Home section background images (заавал биш)
  { key: "home.faves.bg", group: "Нүүр — Дэвсгэр зураг", label: "«Онцлох» хэсгийн дэвсгэр зураг", value: "", image: true },
  { key: "home.cat.bg", group: "Нүүр — Дэвсгэр зураг", label: "«Ангилал» хэсгийн дэвсгэр зураг", value: "", image: true },
  { key: "home.new.bg", group: "Нүүр — Дэвсгэр зураг", label: "«Шинэ цуглуулга» хэсгийн дэвсгэр зураг", value: "", image: true },
  { key: "home.vp.bg", group: "Нүүр — Дэвсгэр зураг", label: "«Давуу тал» хэсгийн дэвсгэр зураг", value: "", image: true },

  // Editorial
  { key: "edito.eyebrow", group: "Нүүр — Editorial", label: "Жижиг гарчиг", value: "Clean Beauty" },
  { key: "edito.title", group: "Нүүр — Editorial", label: "Гарчиг", value: "Арьсанд ээлтэй, ухамсартай гоо сайхан" },
  { key: "edito.body", group: "Нүүр — Editorial", label: "Тайлбар", value: "Бид зөвхөн шалгагдсан, найдвартай найрлагатай бүтээгдэхүүнийг сонгож танд хүргэдэг. Хатуу шалгуур, жинхэнэ чанар.", multiline: true },
  { key: "edito.cta", group: "Нүүр — Editorial", label: "Товч", value: "Арьс арчилгаа үзэх" },

  // Value props
  { key: "vp1.t", group: "Нүүр — Давуу тал", label: "1 — гарчиг", value: "Хурдан хүргэлт" },
  { key: "vp1.d", group: "Нүүр — Давуу тал", label: "1 — тайлбар", value: "УБ хотод 24 цагт" },
  { key: "vp2.t", group: "Нүүр — Давуу тал", label: "2 — гарчиг", value: "100% жинхэнэ" },
  { key: "vp2.d", group: "Нүүр — Давуу тал", label: "2 — тайлбар", value: "Албан ёсны дистрибьютер" },
  { key: "vp3.t", group: "Нүүр — Давуу тал", label: "3 — гарчиг", value: "Амар төлбөр" },
  { key: "vp3.d", group: "Нүүр — Давуу тал", label: "3 — тайлбар", value: "QPay, карт, бэлнээр" },

  // Footer
  { key: "footer.about", group: "Footer", label: "Тухай", value: "Монголын залуу охидод зориулсан, орчин үеийн цэвэрхэн гоо сайхны дэлгүүр. 100% жинхэнэ бүтээгдэхүүн.", multiline: true },
  { key: "footer.address", group: "Footer", label: "Хаяг", value: "Улаанбаатар, Монгол" },
  { key: "footer.phone", group: "Footer", label: "Утас", value: "+976 8000 0000" },
  { key: "footer.email", group: "Footer", label: "И-мэйл", value: "hello@makeupgirls.mn" },

  // Trending on social — постуудыг «Trending / Reels» админ хэсгээс удирдана.
  { key: "trending.eyebrow", group: "Нүүр — Trending", label: "Жижиг гарчиг", value: "@makeupgirls" },
  { key: "trending.title", group: "Нүүр — Trending", label: "Гарчиг", value: "Trending On Social" },

  // Social links
  { key: "social.facebook", group: "Сошиал холбоос", label: "Facebook URL", value: "https://facebook.com/makeupgirls.mn" },
  { key: "social.instagram", group: "Сошиал холбоос", label: "Instagram URL", value: "https://instagram.com/makeupgirls.mn" },
  { key: "social.tiktok", group: "Сошиал холбоос", label: "TikTok URL", value: "https://tiktok.com/@makeupgirls.mn" },
];
