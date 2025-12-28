const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('./models/Course');

// Replace ALL existing courses with Grade 5 + Grade 6 sets
const environmentalCourses = [
  // --- Grade 5 (New set) ---
  {
    courseId: 'food-relationships-5',
    title: 'العلاقات الغذائية',
    description: '5ème (السنة الخامسة) - علوم بيئية',
    gradeLevel: 5,
    order: 1,
    badge: { name: 'مهندس السلسلة الغذائية', icon: '🌍' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'sequencing', title: 'Arrange food chain', points: 25, order: 1, content: { rewardBadgeName: 'حامي الطاقة 🌱' } },
        { id: 'ex2', type: 'quiz', title: 'Producers/Consumers/Decomposers', points: 20, order: 2, content: { rewardBadgeName: 'خبير الأدوار الغذائية 🍃' } },
        { id: 'ex3', type: 'scenario', title: 'Behavior: protect animal food', points: 20, order: 3, content: { rewardBadgeName: 'حامي الغذاء 🛡️' } },
      ],
      games: [
        { id: 'g1', type: 'dragdrop', title: 'سباق السلسلة الغذائية', description: 'حرّك الكائنات إلى أماكنها الصحيحة لتكوين سلاسل غذائية كاملة 🐭→🦁', points: 35, order: 1 },
        { id: 'g2', type: 'flow', title: 'مهمة مراقبة الطاقة', description: 'اضغط على المراحل بالترتيب الصحيح لتشاهد تدفق الطاقة 🔄', points: 30, order: 2 },
        { id: 'g3', type: 'construction', title: 'بناء النظام الغذائي', description: 'اسحب المنتجين والعواشب واللواحم لبناء نظام غذائي متوازن 🌿🐭🦁', points: 35, order: 3, gameData: { rewardBadgeName: 'مهندس السلسلة الغذائية 🌍' } },
      ],
    },
  },
  {
    courseId: 'climatic-factors',
    title: 'العوامل المناخية في الوسط البيئي',
    description: '5ème (السنة الخامسة) - علوم بيئية',
    gradeLevel: 5,
    order: 2,
    badge: { name: 'مستكشف دورة الماء', icon: '🌍💧' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'sequencing', title: 'Order climatic factors', points: 25, order: 1, content: { rewardBadgeName: 'ساحر العوامل الطبيعية 🌞💧' } },
        { id: 'ex2', type: 'quiz', title: 'Water states & rain', points: 20, order: 2, content: { rewardBadgeName: 'محارب العناصر الطبيعية 🌿' } },
        { id: 'ex3', type: 'scenario', title: 'Behavior: polluted water', points: 20, order: 3, content: { rewardBadgeName: 'حامي المياه والهواء 💧🌬️' } },
      ],
      games: [
        { id: 'g1', type: 'runner', title: 'سباق القطرات السحرية 💧🏁', description: 'وجّه قطرة الماء عبر مراحل دورة الماء ⏱️', points: 35, order: 1, gameData: { rewardBadgeName: 'مستكشف دورة الماء 🌍💧' } },
        { id: 'g2', type: 'dragdrop', title: 'تنقية النهر السحري 🧪🌊', description: 'رتّب أدوات التنقية بوضع كل أداة في المرحلة الصحيحة ✅', points: 30, order: 2 },
        { id: 'g3', type: 'decision', title: 'حديقة العوامل الطبيعية 🌞🌬️🌧️', description: 'اختر القرارات الصحيحة لحماية النباتات والحيوانات 🌿', points: 35, order: 3 },
      ],
    },
  },
  {
    courseId: 'eco-balance-5',
    title: 'التوازن البيئي',
    description: '5ème (السنة الخامسة) - علوم بيئية',
    gradeLevel: 5,
    order: 3,
    badge: { name: 'مهندس شبكة التوازن', icon: '🌍🕸️' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'sequencing', title: 'Arrange balance elements', points: 25, order: 1, content: { rewardBadgeName: 'منقذ التوازن البيئي 🌿🛡️' } },
        { id: 'ex2', type: 'quiz', title: 'Roles of decomposers', points: 20, order: 2, content: { rewardBadgeName: 'خبير التوازن البيئي ⚖️' } },
        { id: 'ex3', type: 'scenario', title: 'Behavior: worms', points: 20, order: 3, content: { rewardBadgeName: 'صديق التربة الحية 🪱' } },
      ],
      games: [
        { id: 'g1', type: 'runner', title: 'سباق استعادة التوازن', description: 'استرجع التوازن في 30 ثانية ⏱️', points: 35, order: 1 },
        { id: 'g2', type: 'scenario', title: 'مهمة حماية الغابة', description: 'اختر الحلول لمنع قطع الأشجار والحرائق ورمي النفايات 🌳', points: 30, order: 2 },
        { id: 'g3', type: 'construction', title: 'بناء شبكة التوازن', description: 'ابنِ شبكة توازن تربط العناصر 🕸️', points: 35, order: 3, gameData: { rewardBadgeName: 'مهندس شبكة التوازن 🌍🕸️' } },
      ],
    },
  },
  {
    courseId: 'imbalance-causes',
    title: 'أسباب اختلال التوازن البيئي',
    description: '5ème (السنة الخامسة) - علوم بيئية',
    gradeLevel: 5,
    order: 4,
    badge: { name: 'مهندس الحلول البيئية', icon: '🗺️🌱' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'sequencing', title: 'Rank causes by severity', points: 25, order: 1, content: { rewardBadgeName: 'محلل أسباب الخلل 🧐' } },
        { id: 'ex2', type: 'quiz', title: 'MCQ on causes', points: 20, order: 2, content: { rewardBadgeName: 'خبير أسباب الاختلال ⚠️' } },
        { id: 'ex3', type: 'scenario', title: 'Behavior: plastic', points: 20, order: 3, content: { rewardBadgeName: 'صوت المحيط الصامت 🌊' } },
      ],
      games: [
        { id: 'g1', type: 'runner', title: 'سباق منع الاختلال', description: 'حلّ المشاكل بسرعة ⏱️', points: 35, order: 1 },
        { id: 'g2', type: 'runner', title: 'مهمة إنقاذ الجزيرة', description: 'نظّف وأطفئ وازرع 🌱', points: 40, order: 2 },
        { id: 'g3', type: 'matching', title: 'خريطة الحلول البيئية', description: 'اربط كل مشكلة بحلها الصحيح 🗺️', points: 35, order: 3, gameData: { rewardBadgeName: 'مهندس الحلول البيئية 🗺️🌱' } },
      ],
    },
  },
  {
    courseId: 'human-role',
    title: 'دور الإنسان في المحافظة على التوازن البيئي',
    description: '5ème (السنة الخامسة) - علوم بيئية',
    gradeLevel: 5,
    order: 5,
    badge: { name: 'مهندس التوازن البيئي', icon: '🌿🦅💧' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'sticker', title: 'Quick decision tools', points: 25, order: 1, content: { rewardBadgeName: 'حامي الغابة 🌿🛡️' } },
        { id: 'ex2', type: 'quiz', title: 'Speak for creatures', points: 20, order: 2, content: { rewardBadgeName: 'صديق الكائنات 🐢🦌🐞' } },
        { id: 'ex3', type: 'sticker', title: 'Repair with stickers', points: 25, order: 3, content: { rewardBadgeName: 'محترف إصلاح البيئة 🌍✨' } },
      ],
      games: [
        { id: 'g1', type: 'runner', title: 'سباق أنقذ البيئة', description: 'نفّذ مهام إنقاذ ضمن وقت ⏱️', points: 40, order: 1 },
        { id: 'g2', type: 'scenario', title: 'مهمة مراقبة الطبيعة', description: 'حدد الأخطار واختر الحل 🔍⚠️', points: 35, order: 2 },
        { id: 'g3', type: 'construction', title: 'بناء شبكة التوازن البيئي', description: 'ابنِ شبكة توازن قوية 🕸️', points: 40, order: 3, gameData: { rewardBadgeName: 'مهندس التوازن البيئي 🌿🦅💧' } },
      ],
    },
  },

  {
    courseId: 'respiratory-system-safety',
    title: 'المحافظة على سلامة الجهاز التنفسي',
    description: 'السنة السادسة ابتدائي (الوحدة الثانية)',
    gradeLevel: 6,
    order: 1,
    badge: { name: 'بطل الهواء النقي', icon: '🌬️' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'quiz', title: 'اختَر هواءك!', points: 15, order: 1 },
        { id: 'ex2', type: 'decision', title: 'أنفِك يحكي!', points: 20, order: 2 },
        { id: 'ex3', type: 'sticker', title: 'صلّح بيتك ليتنفّس!', points: 25, order: 3 },
      ],
      games: [
        { id: 'g1', type: 'runner', title: 'سباق أنقذ أنفي!', description: 'اركض عبر شوارع ملوّثة، اجمع الأوراق 🍃 وتجنّب الدخان 💨', points: 35, order: 1, gameData: { collectItems: ['🍃', '🍃', '🍃', '🌿', '🌱'], hazardItems: ['💨', '💨', '⚠️'], lives: 3, timeLimitSec: 35 } },
        { id: 'g2', type: 'map', title: 'مهمة مراقب جودة الهواء', description: 'ضع حساسات جودة الهواء على الخريطة في أماكن مهمة 🗺️📍', points: 30, order: 2, gameData: { rows: 6, cols: 8, sensorIcon: '📍', sensorsToPlace: 3, mapLabel: '🗺️ خريطة المدينة (جودة الهواء)' } },
        { id: 'g3', type: 'construction', title: 'بناء مدينة أنظف', description: 'ابنِ مدينة بوسائل نقل نظيفة، طاقة نظيفة، ومساحات خضراء 🌳⚡🚲', points: 35, order: 3 },
      ],
    },
  },
  {
    courseId: 'eco-components',
    title: 'مكونات الوسط البيئي',
    description: 'السنة السادسة ابتدائي (الوحدة الثالثة)',
    gradeLevel: 6,
    order: 2,
    badge: { name: 'عضو شرفي في عائلة الطبيعة', icon: '🌍' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'quiz', title: 'من ينتمي إلى العائلة؟', points: 20, order: 1 },
        { id: 'ex2', type: 'quiz', title: 'لماذا هذا العنصر مهم؟', points: 20, order: 2 },
        { id: 'ex3', type: 'sticker', title: 'صلّح العائلة المفككة', points: 25, order: 3 },
      ],
      games: [
        { id: 'g1', type: 'runner', title: 'سباق أعد العائلة!', description: 'اجمع عناصر الوسط البيئي قبل أن تختفي! 🫧', points: 35, order: 1 },
        { id: 'g2', type: 'scenario', title: 'مهمة راقب تفاعل العائلة', description: 'راقب تفاعل عناصر الوسط البيئي واختر ما يحدث بينها 🌊🌿', points: 30, order: 2 },
        { id: 'g3', type: 'construction', title: 'بناء عائلتك البيئية', description: 'اختر وسطًا بيئيًا وأضف 3 عناصر حية + 3 عناصر غير حية 🌍', points: 35, order: 3 },
      ],
    },
  },
  {
    courseId: 'food-chains-6',
    title: 'السلاسل الغذائية',
    description: 'السنة السادسة ابتدائي (الوحدة الثالثة)',
    gradeLevel: 6,
    order: 3,
    badge: { name: 'حارس الدورة الأبدية', icon: '🌍' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'quiz', title: 'أين تذهب الطاقة؟', points: 20, order: 1 },
        { id: 'ex2', type: 'quiz', title: 'لماذا لا ينتهي الماء؟', points: 20, order: 2 },
        { id: 'ex3', type: 'quiz', title: 'اختَر السلسلة الصحيحة!', points: 20, order: 3 },
      ],
      games: [
        { id: 'g1', type: 'dragdrop', title: 'سباق أنقذ الدورة!', description: 'أصلح الدورة بإسقاط كل عنصر في مكانه الصحيح 🔄', points: 35, order: 1 },
        { id: 'g2', type: 'flow', title: 'مهمة راقب تدفق الطاقة', description: 'شاهد الطاقة في كل مرحلة وكيف تتناقص 💨', points: 30, order: 2 },
        { id: 'g3', type: 'construction', title: 'بناء سلسلتك البحرية', description: 'ابنِ سلسلة غذائية من 4 مراحل وتأكد من وجود محلّل 🦠', points: 35, order: 3 },
      ],
    },
  },
  {
    courseId: 'eco-balance',
    title: 'التوازن البيئي',
    description: 'السنة السادسة ابتدائي (الوحدة الثالثة)',
    gradeLevel: 6,
    order: 4,
    badge: { name: 'حامي التوازن المتكامل', icon: '🌍' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'matching', title: 'ما نوع الاختلال؟', points: 20, order: 1 },
        { id: 'ex2', type: 'quiz', title: 'أعد التوازن!', points: 25, order: 2 },
        { id: 'ex3', type: 'decision', title: 'اختَر القرار الصحيح!', points: 20, order: 3 },
      ],
      games: [
        { id: 'g1', type: 'dragdrop', title: 'سباق أنقذ التوازن!', description: 'اسحب الحلول إلى المشكلة المناسبة لاسترجاع التوازن ⚖️', points: 35, order: 1 },
        { id: 'g2', type: 'scenario', title: 'مهمة راقب التفاعل', description: 'راقب التفاعل بين O₂ و CO₂ وضوء الشمس والحيوانات 🐾☀️', points: 30, order: 2 },
        { id: 'g3', type: 'construction', title: 'بناء نظامك المتوازن', description: 'ابنِ نظامًا فيه 3 كائنات + 3 عناصر غير حية ⚖️🌱💧', points: 35, order: 3 },
      ],
    },
  },
  {
    courseId: 'water-pollution',
    title: 'تلوث الأوساط المائية',
    description: 'السنة السادسة ابتدائي (الوحدة الثالثة)',
    gradeLevel: 6,
    order: 5,
    badge: { name: 'منقذ الأنهار', icon: '🌊' },
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'matching', title: 'من أين يأتي التلوث؟', points: 20, order: 1 },
        { id: 'ex2', type: 'decision', title: 'كيف تحمي ماءك؟', points: 20, order: 2 },
        { id: 'ex3', type: 'quiz', title: 'اختَر الحل الأذكى!', points: 20, order: 3 },
      ],
      games: [
        { id: 'g1', type: 'runner', title: 'سباق نظّف النهر!', description: 'اجمع النفايات من النهر وتجنّب الأفعال الخاطئة ⚠️', points: 35, order: 1 },
        { id: 'g2', type: 'lab', title: 'مهمة افحص ماءك!', description: 'افحص عينات الماء (pH، بكتيريا، معادن) 🧪', points: 35, order: 2 },
        { id: 'g3', type: 'construction', title: 'بناء نظامك النظيف', description: 'اختر أدوات تحافظ على ماء البيت نظيفًا 💧🏡', points: 30, order: 3 },
      ],
    },
  },
];

async function seedEnvironmental() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecolearn';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Replace ALL existing courses
        await Course.deleteMany({});
        console.log('Cleared ALL existing courses');

        const inserted = await Course.insertMany(environmentalCourses);
        console.log(`✅ Successfully inserted ${inserted.length} environmental courses`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding environmental courses:', error);
        process.exit(1);
    }
}

seedEnvironmental();
