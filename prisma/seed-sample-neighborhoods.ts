/**
 * نمونه: حدود ۱۰۰ محله تهران و البرز + ۱۰ خبر در هر محله تا رنکینگ معنا پیدا کند.
 * استفاده: بعد از seed اصلی، npm run db:seed-sample
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .toLowerCase()
    || 'mahal';
}

// محلات تهران (شهر تهران)
const TEHRAN_NEIGHBORHOODS = [
  'نارمک', 'جوادیه', 'پیروزی', 'تهرانپارس', 'ستارخان', 'جنت‌آباد', 'هروی', 'دزاشیب', 'تجریش', 'دروس',
  'سعادت‌آباد', 'شهرک غرب', 'الهیه', 'زعفرانیه', 'ولنجک', 'اوین', 'فرمانیه', 'قیطریه', 'آرارات', 'پونک',
  'شهران', 'کوهسار', 'مرزداران', 'باغ فیض', 'طرشت', 'ونک', 'نصر', 'لویزان', 'اقدسیه', 'چیذر',
  'نیاوران', 'حصارک', 'ازگل', 'سوهانک', 'شمس‌آباد', 'داوودیه', 'یوسف‌آباد', 'امیرآباد', 'کارگر', 'بهارستان',
  'پامنار', 'سنگلج', 'قنات‌آباد', 'هرندی', 'شاپور', 'راه‌آهن', 'نازی‌آباد', 'آریاشهر', 'صادقیه', 'شهرآرا',
  'جلالیه', 'برق', 'تیموری', 'بیمه', 'آذری', 'خانی‌آباد', 'شهرک رضوی', 'باغ آذری', 'میدان کاج',
  'شمیران نو', 'دارآباد', 'درکه', 'جمشیدیه', 'جماران', 'درود', 'قلهک', 'دربند', 'ضرابخانه',
];

// محلات استان البرز (کرج و حومه)
const ALBORZ_NEIGHBORHOODS = [
  'گوهردشت', 'مهرشهر', 'مهرویلا', 'حصارک کرج', 'فاز ۱ مهرشهر', 'فاز ۲ مهرشهر', 'کوی کارمندی', 'مصباح', 'عظیمیه',
  'ماشین‌سازان', 'حصار', 'محمدشهر', 'گرمدره', 'فردیس', 'پل خواب', 'شهرک صنعتی', 'هفت جوی', 'مشکین‌دشت', 'کمالشهر',
  'مشکین‌آباد', 'شهر جدید هشتگرد', 'طالقان', 'ساوجبلاغ', 'فشند', 'آسارا', 'شهرک جهان‌نما', 'پردیسان', 'مهرگان',
  'راه‌آهن کرج', 'میدان مادر', 'باغستان', 'مشکین‌آباد', 'حیدرآباد', 'مصطفی‌خانی', 'شهرک بهار', 'شهرک امید',
];

// جمعاً ۱۰۰ محله: ۶۲ تهران + ۳۸ البرز
const PROVINCES = [
  { name: 'تهران', slug: 'tehran', cities: [{ name: 'تهران', slug: 'tehran', neighborhoods: TEHRAN_NEIGHBORHOODS.slice(0, 62) }] },
  {
    name: 'البرز',
    slug: 'alborz',
    cities: [
      { name: 'کرج', slug: 'karaj', neighborhoods: ALBORZ_NEIGHBORHOODS.slice(0, 25) },
      { name: 'ساوجبلاغ', slug: 'savojbolagh', neighborhoods: ALBORZ_NEIGHBORHOODS.slice(25, 38) },
    ],
  },
];

// قالب‌های خبر مثبت (برای رنک سبز)
const POSITIVE_TEMPLATES = [
  { title: 'افتتاح پارک جدید در محله', body: 'با حضور مسئولان، پارک و فضای سبز جدید در این محله راه‌اندازی شد. این پروژه با استقبال شهروندان مواجه شد. خدمات رایگان تفریحی در اختیار اهالی قرار گرفت.' },
  { title: 'بهبود روشنایی معابر محله', body: 'طرح بهبود روشنایی معابر در این محله به پایان رسید. احداث چراغ‌های جدید امنیت را افزایش داده است. شهروندان از این برنامه استقبال کردند.' },
  { title: 'جشنواره فرهنگی در محله', body: 'همایش فرهنگی با برنامه‌های متنوع در این محله برگزار شد. مسابقه و جشن با حضور پرشور اهالی همراه بود. این رویداد موفق با استقبال مواجه شد.' },
  { title: 'ساخت کتابخانه محله', body: 'احداث کتابخانه محله با خدمات رایگان برای کودکان و نوجوانان. پروژه با موفقیت به بهره‌برداری رسید. بهبود فضای مطالعه در محله.' },
  { title: 'راه‌اندازی سرویس حمل و نقل محله', body: 'سرویس حمل و نقل عمومی در محله راه‌اندازی شد. این خدمات رایگان برای سالمندان و دانش‌آموزان در نظر گرفته شده است. پروژه با موفقیت انجام شد.' },
];

// قالب‌های خبر منفی (برای رنک قرمز)
const NEGATIVE_TEMPLATES = [
  { title: 'حادثه رانندگی در محله', body: 'تصادف خودرو در یکی از معابر این محله رخ داد. دو نفر زخمی و یک نفر آسیب‌دید. ماموران در محل حاضر شدند. خسارت به اموال گزارش شده است.' },
  { title: 'سرقت از منزل در محله', body: 'سرقت از یک واحد مسکونی در این محله گزارش شد. متهم پس از دستگیری به مراجع قضایی تحویل داده شد. شهروندان از افزایش جرم در منطقه شکایت دارند.' },
  { title: 'درگیری و نزاع در محله', body: 'درگیری بین چند نفر در این محله منجر به جراحت دو نفر شد. پلیس برای آرام کردن وضعیت اعزام شد. یک نفر دستگیری و به زندان منتقل شد.' },
  { title: 'آتش‌سوزی در محله', body: 'آتش‌سوزی در یک انبار در این محله خسارت مالی به بار آورد. آتش‌نشانی در محل حاضر شد. فوت یک نفر و آسیب چند نفر گزارش شده است.' },
  { title: 'اعتراض به آلودگی در محله', body: 'شهروندان به آلودگی محیط زیست و مشکل دفع زباله در محله اعتراض کردند. شکایت به شهرداری ثبت شد. تخریب فضای سبز محل نگرانی است.' },
];

// قالب‌های خنثی/مختلط (برای رنک زرد)
const NEUTRAL_TEMPLATES = [
  { title: 'برگزاری مسابقه ورزشی در محله', body: 'مسابقه فوتبال بین تیم‌های محل برگزار شد. برنامه با استقبال اهالی همراه بود. گزارش از وضعیت ترافیک در اطراف محل برگزاری.' },
  { title: 'جلسه شورای محله', body: 'جلسه شورای محله با حضور مسئولان برگزار شد. موضوعات مختلف از جمله خدمات شهری مطرح شد. شهروندان مشکلات محله را مطرح کردند.' },
];

async function ensureUniqueSlug(prisma: PrismaClient, base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const exists = await prisma.neighborhood.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${++n}`;
  }
}

async function main() {
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.error('اول seed اصلی را اجرا کنید: npm run db:seed');
    process.exit(1);
  }
  const bySlug: Record<string, { id: string }> = {};
  for (const c of categories) bySlug[c.slug] = { id: c.id };

  const catPositive = [bySlug.farhangi, bySlug.varzeshi, bySlug.ejtemaei].filter(Boolean);
  const catNegative = [bySlug.nezami, bySlug.siasi, bySlug['mohit-zist']].filter(Boolean);
  const catNeutral = [bySlug.ejtemaei, bySlug.eghtesad].filter(Boolean);

  const allNeighborhoods: Array<{ name: string; slug: string; province: string; provinceSlug: string; city: string; citySlug: string; tone: number }> = [];
  for (const prov of PROVINCES) {
    for (const city of prov.cities) {
      for (const name of city.neighborhoods) {
        const baseSlug = slugify(name);
        const slug = await ensureUniqueSlug(prisma, baseSlug);
        const tone = Math.random();
        allNeighborhoods.push({
          name,
          slug,
          province: prov.name,
          provinceSlug: prov.slug,
          city: city.name,
          citySlug: city.slug,
          tone,
        });
      }
    }
  }

  let createdNeighborhoods = 0;
  for (const n of allNeighborhoods) {
    await prisma.neighborhood.upsert({
      where: { slug: n.slug },
      update: { province: n.province, provinceSlug: n.provinceSlug, city: n.city, citySlug: n.citySlug },
      create: {
        name: n.name,
        slug: n.slug,
        province: n.province,
        provinceSlug: n.provinceSlug,
        city: n.city,
        citySlug: n.citySlug,
      },
    });
    createdNeighborhoods++;
  }
  console.log('محلات ایجاد/بروز شد:', createdNeighborhoods);

  const neighborhoods = await prisma.neighborhood.findMany({
    where: { slug: { in: allNeighborhoods.map((n) => n.slug) } },
  });
  const hoodBySlug = new Map(neighborhoods.map((h) => [h.slug, { ...h, tone: allNeighborhoods.find((a) => a.slug === h.slug)!.tone }]));

  let newsCount = 0;
  const now = new Date();
  for (const hood of neighborhoods) {
    const meta = hoodBySlug.get(hood.slug);
    const tone = meta?.tone ?? 0.5;

    for (let i = 0; i < 10; i++) {
      let title: string;
      let body: string;
      let catIds: string[];

      const r = Math.random();
      if (tone >= 0.6 && r < 0.6) {
        const t = POSITIVE_TEMPLATES[Math.floor(Math.random() * POSITIVE_TEMPLATES.length)];
        title = `${t.title} ${hood.name}`;
        body = t.body;
        catIds = catPositive.length ? [catPositive[Math.floor(Math.random() * catPositive.length)]!.id] : [categories[0]!.id];
      } else if (tone <= 0.4 && r < 0.6) {
        const t = NEGATIVE_TEMPLATES[Math.floor(Math.random() * NEGATIVE_TEMPLATES.length)];
        title = `${t.title} ${hood.name}`;
        body = t.body;
        catIds = catNegative.length ? [catNegative[Math.floor(Math.random() * catNegative.length)]!.id] : [categories[0]!.id];
      } else {
        const t = NEUTRAL_TEMPLATES[Math.floor(Math.random() * NEUTRAL_TEMPLATES.length)];
        title = `${t.title} ${hood.name}`;
        body = t.body;
        catIds = catNeutral.length ? [catNeutral[Math.floor(Math.random() * catNeutral.length)]!.id] : [categories[0]!.id];
      }

      const slug = `sample-${hood.slug}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = new Date(now.getTime() - (10 - i) * 24 * 60 * 60 * 1000);
      const imageSeed = `${hood.slug}-${i}`.replace(/[^a-z0-9-]/gi, '');
      const imageUrl = `https://picsum.photos/seed/${imageSeed}/800/500`;

      await prisma.news.create({
        data: {
          title,
          slug,
          summary: title,
          body,
          imageUrl,
          neighborhoodId: hood.id,
          categories: { connect: catIds.map((id) => ({ id })) },
          published: true,
          featured: false,
          createdAt,
          updatedAt: createdAt,
        },
      });
      newsCount++;
    }
  }

  console.log('اخبار نمونه ایجاد شد:', newsCount);
  console.log('پایان. برای به‌روزرسانی رنکینگ محلات در پنل ادمین دکمه «محاسبه وضعیت همه محله‌ها» را بزنید.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
