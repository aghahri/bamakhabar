import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashed, name: 'مدیر باماخبر' },
  });

  const categories = [
    { name: 'سیاسی', slug: 'siasi', order: 1 },
    { name: 'نظامی', slug: 'nezami', order: 2 },
    { name: 'اجتماعی', slug: 'ejtemaei', order: 3 },
    { name: 'فرهنگی', slug: 'farhangi', order: 4 },
    { name: 'ورزشی', slug: 'varzeshi', order: 5 },
    { name: 'اقتصاد', slug: 'eghtesad', order: 6 },
    { name: 'محیط زیست', slug: 'mohit-zist', order: 7 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const neighborhoods = [
    { name: 'نارمک', slug: 'narmak', province: 'تهران', provinceSlug: 'tehran', city: 'تهران', citySlug: 'tehran' },
    { name: 'جوادیه', slug: 'javadieh', province: 'تهران', provinceSlug: 'tehran', city: 'تهران', citySlug: 'tehran' },
    { name: 'پیروزی', slug: 'pirouzi', province: 'تهران', provinceSlug: 'tehran', city: 'تهران', citySlug: 'tehran' },
    { name: 'تهرانپارس', slug: 'tehranpars', province: 'تهران', provinceSlug: 'tehran', city: 'تهران', citySlug: 'tehran' },
    { name: 'ستارخان', slug: 'sattarkhan', province: 'تهران', provinceSlug: 'tehran', city: 'تهران', citySlug: 'tehran' },
    { name: 'جنت‌آباد', slug: 'jannatabad', province: 'تهران', provinceSlug: 'tehran', city: 'تهران', citySlug: 'tehran' },
    { name: 'شیراز مرکزی', slug: 'shiraz-markazi', province: 'فارس', provinceSlug: 'fars', city: 'شیراز', citySlug: 'shiraz' },
    { name: 'قصر قاجار', slug: 'ghasr-qajar', province: 'فارس', provinceSlug: 'fars', city: 'شیراز', citySlug: 'shiraz' },
    { name: 'اصفهان مرکزی', slug: 'isfahan-markazi', province: 'اصفهان', provinceSlug: 'isfahan', city: 'اصفهان', citySlug: 'isfahan' },
    { name: 'جلفا', slug: 'jolfa', province: 'اصفهان', provinceSlug: 'isfahan', city: 'اصفهان', citySlug: 'isfahan' },
    { name: 'مشهد مرکزی', slug: 'mashhad-markazi', province: 'خراسان رضوی', provinceSlug: 'khorasan-razavi', city: 'مشهد', citySlug: 'mashhad' },
  ];

  function toSlug(s: string): string {
    return s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '').toLowerCase() || s;
  }

  for (const n of neighborhoods) {
    await prisma.neighborhood.upsert({
      where: { slug: n.slug },
      update: { provinceSlug: n.provinceSlug, citySlug: n.citySlug },
      create: n,
    });
  }

  const allNeighborhoods = await prisma.neighborhood.findMany();
  for (const n of allNeighborhoods) {
    if (n.province && !n.provinceSlug) {
      await prisma.neighborhood.update({
        where: { id: n.id },
        data: {
          provinceSlug: toSlug(n.province),
          citySlug: n.city ? toSlug(n.city) : null,
        },
      });
    }
  }

  const catEjtemaei = await prisma.category.findUnique({ where: { slug: 'ejtemaei' } });
  const catFarhangi = await prisma.category.findUnique({ where: { slug: 'farhangi' } });
  const catMohit = await prisma.category.findUnique({ where: { slug: 'mohit-zist' } });
  const narmak = await prisma.neighborhood.findUnique({ where: { slug: 'narmak' } });
  const javadieh = await prisma.neighborhood.findUnique({ where: { slug: 'javadieh' } });
  const tehranpars = await prisma.neighborhood.findUnique({ where: { slug: 'tehranpars' } });
  const jolfa = await prisma.neighborhood.findUnique({ where: { slug: 'jolfa' } });
  const shiraz = await prisma.neighborhood.findUnique({ where: { slug: 'shiraz-markazi' } });

  const sampleNews = [
    {
      title: 'شهادت پیشوای امت، حضرت آیت‌الله العظمی امام خامنه‌ای',
      slug: 'shahadat-pishva-emmat',
      summary: 'شهادت رهبر عزیز و بزرگوار انقلاب اسلامی، پیشوای بصیر و استوار ملت ایران و چراغ هدایتی که با شهادتش هرگز خاموش نمی‌شود را محضر حضرت صاحب الزمان (عج) و ملت شریف و شهیدپرور ایران تسلیت عرض می‌نماییم.',
      body: `بسم الله الرحمن الرحیم

«یُرِیدُونَ لِیُطْفِئُوا نُورَ اللَّهِ بِأَفْوَاهِهِمْ وَاللَّهُ مُتِمُّ نُورِهِ وَلَوْ کَرِهَ الْکَافِرُونَ» (سوره صف، آیه ۸)

شهادت پیشوای امت، حضرت آیت‌الله العظمی امام خامنه‌ای، رهبر عزیز و بزرگوار انقلاب اسلامی، پیشوای بصیر و استوار ملت ایران و چراغ هدایتی که با شهادتش هرگز خاموش نمی‌شود را محضر حضرت صاحب الزمان (عج) و ملت شریف و شهیدپرور ایران تسلیت عرض می‌نماییم.

ایشان با ردای شهادت و زبان روزه در ماه مبارک رمضان به مولایش امیرالمؤمنین اقتدا کرد؛ ما نیز عهد می‌بندیم علمی را که ایشان ۳۷ سال مقتدرانه و حکیمانه در گذر از گردنه‌های دشوار در دست داشت، همواره برافراشته نگه داریم.`,
      categoryIds: [catFarhangi!.id],
      neighborhoodId: null as string | null,
      imageUrl: '/agha-image.png',
      published: true,
      featured: true,
    },
    {
      title: 'بهبود فضای سبز و پارک‌های محله نارمک تهران',
      slug: 'fazaye-sabz-narmak-tehran',
      summary: 'نارمک به عنوان یکی از سرسبزترین محله‌های شرق تهران شناخته می‌شود. پارک فدک، بوستان تسلیحات و پارک مدائن از جمله فضاهای سبز این محله هستند.',
      body: 'محله نارمک به عنوان یکی از سرسبزترین و قدیمی‌ترین محله‌های شرق تهران شناخته می‌شود و دارای فضای سبز گسترده است.\n\nنارمک از چندین پارک و بوستان مهم برخوردار است از جمله پارک فدک، بوستان تسلیحات و پارک مدائن. این فضاهای سبز از جمله امکانات تفریحی و رفاهی مهم این منطقه محسوب می‌شوند که به کیفیت زندگی در محله کمک می‌کنند.\n\nدر گذشته، نارمک به دلیل داشتن باغ‌های بزرگ انار و زمین‌های سرسبز معروف بود. نام نارمک از ترکیب «نار» (انار) و «مک» (مکان) گرفته شده است. امروزه محله نارمک به خاطر موقعیت در دامنه‌های جنوبی البرز، دارای آب‌وهوایی نسبتاً خنک‌تر و دلپذیرتر است.',
      categoryIds: [catMohit!.id],
      neighborhoodId: narmak?.id ?? null,
      imageUrl: 'https://picsum.photos/seed/narmak-park/800/500',
      published: true,
      featured: false,
    },
    {
      title: 'توضیحات پلیس درباره حادثه چاقوکشی در محله جوادیه',
      slug: 'chaghookeshi-javadieh-tehran',
      summary: 'رئیس کلانتری جوادیه از دستگیری فرد مهاجم در پی درگیری و چاقوکشی در این محله خبر داد.',
      body: 'رئیس کلانتری جوادیه تهران در گفت‌گو با خبرنگاران اعلام کرد که در پی گزارش شهروندان از درگیری و چاقوکشی در یکی از کوچه‌های این محله، ماموران به محل اعزام شدند.\n\nوی افزود: متهم که به دلیل مصرف مواد روان‌گردان دچار توهم شده بود، با سنگ شیشه منزل همسایگان را شکسته و سپس با سلاح سرد به چند نفر حمله کرده بود. پس از مقاومت در برابر پلیس، این فرد دستگیر و به مراجع قضایی تحویل داده شد.',
      categoryIds: [catEjtemaei!.id],
      neighborhoodId: javadieh?.id ?? null,
      imageUrl: 'https://picsum.photos/seed/javadieh-1/800/500',
      published: true,
      featured: false,
    },
    {
      title: 'اجرای طرح جمع‌آوری زباله‌های خشک در تهرانپارس',
      slug: 'zabaleh-koshk-tehranpars',
      summary: 'شهرداری منطقه ۴ از آغاز طرح تفکیک از مبدأ در محله تهرانپارس خبر داد.',
      body: 'معاون خدمات شهری شهرداری منطقه ۴ تهران از اجرای طرح جمع‌آوری زباله‌های خشک در محله تهرانپارس خبر داد.\n\nدر این طرح شهروندان می‌توانند پسماند خشک خود را در روزهای مشخص به ماموران تحویل دهند. این طرح با هدف کاهش زباله و بازیافت بهتر در محلات شرق تهران اجرا می‌شود.',
      categoryIds: [catMohit!.id],
      neighborhoodId: tehranpars?.id ?? null,
      imageUrl: 'https://picsum.photos/seed/tehranpars-1/800/500',
      published: true,
      featured: false,
    },
    {
      title: 'بازگشایی کتابخانه محله جلفا اصفهان پس از بازسازی',
      slug: 'ketabkhane-jolfa-isfahan',
      summary: 'کتابخانه عمومی محله جلفا با حضور مسئولان و اهالی پس از چند ماه بازسازی مجدداً افتتاح شد.',
      body: 'کتابخانه عمومی جلفا در محله تاریخی جلفای اصفهان پس از بازسازی و نوسازی تجهیزات، با حضور مسئولان شهری و فرهنگی و جمعی از اهالی محله بازگشایی شد.\n\nاین کتابخانه با بیش از ۱۰ هزار جلد کتاب در حوزه‌های مختلف و فضای مطالعه برای کودکان و بزرگسالان، یکی از مراکز فرهنگی مهم محله جلفا به شمار می‌رود.',
      categoryIds: [catFarhangi!.id],
      neighborhoodId: jolfa?.id ?? null,
      imageUrl: 'https://picsum.photos/seed/jolfa-library/800/500',
      published: true,
      featured: false,
    },
    {
      title: 'برگزاری جشنواره گل در محله قصر قاجار شیراز',
      slug: 'jashvare-gol-shiraz',
      summary: 'جشنواره گل و گیاه در بوستان محله قصر قاجار شیراز با استقبال شهروندان برگزار شد.',
      body: 'جشنواره گل و گیاه به مناسبت آغاز فصل بهار در بوستان محله قصر قاجار شیراز برگزار شد.\n\nدر این جشنواره غرفه‌های فروش گل و گیاهان زینتی و همچنین کارگاه‌های آموزشی برای شهروندان دایر بود. مسئولان شهری از توسعه فضای سبز در محلات شیراز خبر دادند.',
      categoryIds: [catMohit!.id],
      neighborhoodId: shiraz?.id ?? null,
      imageUrl: 'https://picsum.photos/seed/shiraz-flower/800/500',
      published: true,
      featured: false,
    },
    {
      title: 'نصب دوربین‌های نظارتی در معابر محله پیروزی',
      slug: 'dorbin-pirouzi-tehran',
      summary: 'شهرداری از نصب ۲۰ دستگاه دوربین نظارتی در معابر اصلی محله پیروزی برای افزایش امنیت خبر داد.',
      body: 'معاون حمل و نقل و ترافیک شهرداری منطقه ۱۲ از نصب دوربین‌های نظارتی در محله پیروزی خبر داد.\n\nبه گفته وی، این دوربین‌ها در معابر اصلی و پرتردد نصب شده‌اند و با هدف افزایش امنیت و نظارت بر ترافیک به بهره‌برداری رسیده‌اند.',
      categoryIds: [catEjtemaei!.id],
      neighborhoodId: (await prisma.neighborhood.findUnique({ where: { slug: 'pirouzi' } }))?.id ?? null,
      imageUrl: 'https://picsum.photos/seed/pirouzi-1/800/500',
      published: true,
      featured: false,
    },
  ];

  for (const news of sampleNews) {
    const { categoryIds, ...rest } = news;
    await prisma.news.upsert({
      where: { slug: news.slug },
      update: {
        imageUrl: news.imageUrl ?? null,
        categories: { set: categoryIds.map((id) => ({ id })) },
      },
      create: {
        ...rest,
        categories: { connect: categoryIds.map((id) => ({ id })) },
      },
    });
  }

  console.log('Seed completed.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
