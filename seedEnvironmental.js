const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('./models/Course');

const environmentalCourses = [
    {
        courseId: 'climatic-factors',
        title: 'العوامل المناخية في الوسط البيئي',
        description: 'رحلة مشوقة لاستكشاف كيف تؤثر الشمس والريح والمطر على حياتنا وجمال طبيعتنا.',
        gradeLevel: 5,
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/al-do-HGuIk',
        sections: {
            video: {
                title: 'رحلة عناصر الماء والهواء السحرية',
                url: 'https://www.youtube.com/embed/al-do-HGuIk',
                description: 'قصة مشوقة تشرح دورة الماء، تأثير الشمس، الرياح، والمطر على الطبيعة بأسلوب قصصي بسيط.'
            },
            exercises: [
                { id: 'q1', type: 'sequencing', title: 'رتب العوامل المناخية', points: 15, order: 1 },
                { id: 'q2', type: 'quiz', title: 'تأثير نقص المطر', points: 10, order: 2 },
                { id: 'q3', type: 'scenario', title: 'النباتات الذابلة', points: 15, order: 3 }
            ],
            games: [
                { id: 'g1', type: 'rescue', title: 'سباق قطرة الماء السحرية', description: 'ساعد القطرة في الوصول إلى النهر وتجاوز العوائق!', points: 25, order: 1 },
                { id: 'g2', type: 'simulation', title: 'تطهير النهر السحري', description: 'استخدم الأدوات لتنقية مياه النهر من التلوث', points: 30, order: 2 },
                { id: 'g3', type: 'construction', title: 'حديقة العوامل الطبيعية', description: 'ابنِ حديقة وراقب تأثير الشمس والمطر عليها', points: 35, order: 3 }
            ]
        }
    },
    {
        courseId: 'eco-balance',
        title: 'التوازن البيئي',
        description: 'اكتشف الخيط الخفي الذي يربط بين جميع الكائنات الحية ويجعل غابتنا سعيدة ومتوازنة.',
        gradeLevel: 5,
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/3XaI6Ez8u5I',
        sections: {
            video: {
                title: 'التوازن... الخيط الخفي!',
                url: 'https://www.youtube.com/embed/3XaI6Ez8u5I',
                description: 'رحلة داخل غابة متوازنة توضح العلاقة بين المفترسات، الفرائس، والمحللات.'
            },
            exercises: [
                { id: 'q4', type: 'sequencing', title: 'مكونات النظام البيئي', points: 20, order: 1 },
                { id: 'q5', type: 'quiz', title: 'أهمية ديدان الأرض', points: 10, order: 2 },
                { id: 'q6', type: 'scenario', title: 'احترام الكائنات الصغيرة', points: 15, order: 3 }
            ],
            games: [
                { id: 'g4', type: 'simulation', title: 'سباق استعادة التوازن', description: 'أعد التوازن للغابة من خلال وضع الكائنات في أماكنها', points: 30, order: 1 },
                { id: 'g5', type: 'rescue', title: 'مهمة حامي الغابة', description: 'أنقذ الكائنات المهددة وأعد توزيعها بشكل متوازن', points: 30, order: 2 },
                { id: 'g6', type: 'construction', title: 'باني شبكة التوازن', description: 'اربط بين الكائنات لبناء شبكة غذائية متينة ومستقرة', points: 35, order: 3 }
            ]
        }
    },
    {
        courseId: 'imbalance-causes',
        title: 'أسباب اختلال التوازن البيئي',
        description: 'تعرف على التحديات التي تواجه كوكبنا والجزيرة السحرية، وكيف يمكننا منع حدوث الخراب.',
        gradeLevel: 5,
        order: 3,
        videoUrl: 'https://www.youtube.com/embed/Q1AstntwH3U',
        sections: {
            video: {
                title: 'الغازي الذي دمر جزيرتي!',
                url: 'https://www.youtube.com/embed/Q1AstntwH3U',
                description: 'جزيرة خضراء تتحول لخراب بسبب الكائنات الدخيلة، قطع الأشجار، والمبيدات.'
            },
            exercises: [
                { id: 'q7', type: 'sequencing', title: 'أسباب الاختلال', points: 20, order: 1 },
                { id: 'q8', type: 'quiz', title: 'تأثير المبيدات', points: 10, order: 2 },
                { id: 'q9', type: 'scenario', title: 'البلاستيك في البحر', points: 15, order: 3 }
            ],
            games: [
                { id: 'g7', type: 'decision', title: 'سباق الوقاية من الاختلال', description: 'اختر القرارات الصحيحة لحماية توازن البيئة', points: 25, order: 1 },
                { id: 'g8', type: 'rescue', title: 'مهمة إنقاذ الجزيرة', description: 'نظف الجزيرة من البلاستيك وأوقف قطع الأشجار', points: 35, order: 2 },
                { id: 'g9', type: 'construction', title: 'خريطة بناء الحلول', description: 'صل بين المشاكل البيئية وحلولها الصحيحة', points: 30, order: 3 }
            ]
        }
    },
    {
        courseId: 'imbalance-causes-extended',
        title: 'أسباب اختلال التوازن البيئي (مفصل)',
        description: 'تعمق في فهم الأسرار البيئية وكيف يغير تدخل الإنسان حياة الغابة والجزيرة.',
        gradeLevel: 5,
        order: 4,
        videoUrl: 'https://www.youtube.com/embed/Q1AstntwH3U',
        sections: {
            video: {
                title: 'الغازي الذي دمر جزيرتي! (القصة الكاملة)',
                url: 'https://www.youtube.com/embed/Q1AstntwH3U',
                description: 'تحول درامي لجزيرة كانت جنة، يظهر فيه الأرانب الدخيلة وأثر أفعال الإنسان بالتفصيل.'
            },
            exercises: [
                { id: 'q10', type: 'sequencing', title: 'رتب الأسباب والحلول', points: 20, order: 1 },
                { id: 'q11', type: 'quiz', title: 'تكاثر الأنواع الدخيلة', points: 10, order: 2 }
            ],
            games: [
                { id: 'g10', type: 'decision', title: 'سباق الوقاية (تحدي الوقت)', description: 'حل المشاكل البيئية في 15 ثانية فقط!', points: 40, order: 1 },
                { id: 'g11', type: 'rescue', title: 'مهمة إنقاذ الجزيرة الكبرى', description: 'أطفئ الحرائق، ازرع الأشجار، وأطلق الأعداء الطبيعيين للأنواع الدخيلة', points: 40, order: 2 },
                { id: 'g12', type: 'construction', title: 'مخطط الحلول التونسية', description: 'صل مشاكل تونس البيئية بحلولها المستدامة', points: 35, order: 3 }
            ]
        }
    },
    {
        courseId: 'human-role',
        title: 'دور الإنسان في المحافظة على التوازن البيئي',
        description: 'أنت البطل! تعلم كيف تحمل شعلة الحماية وترمم الطبيعة في غابتنا الجميلة بتونس.',
        gradeLevel: 5,
        order: 5,
        videoUrl: 'https://www.youtube.com/embed/HoWSO881-Bg',
        sections: {
            video: {
                title: 'أنت البطل... حامي الغابة!',
                url: 'https://www.youtube.com/embed/HoWSO881-Bg',
                description: 'نداء للطبيعة واستعراض لجمال تونس، وتكليف البطل (أنت) بمهام الترميم والحماية.'
            },
            exercises: [
                { id: 'q13', type: 'decision', title: 'القرار السريع', points: 20, order: 1 },
                { id: 'q14', type: 'scenario', title: 'لسان الكائن المتضرر', points: 20, order: 2 },
                { id: 'q15', type: 'sticker', title: 'إصلاح الملصقات', points: 15, order: 3 }
            ],
            games: [
                { id: 'g13', type: 'rescue', title: 'سباق إنقاذ البيئة', description: 'تحكم في الشخصية لإصلاح الأضرار: غرس، تنظيف، وحماية في وقت محدد', points: 40, order: 1 },
                { id: 'g14', type: 'simulation', title: 'مهمة مراقب الطبيعة', description: 'راقب الحقول والغابات واكتشف المخاطر وقدم الحلول فوراً', points: 35, order: 2 },
                { id: 'g15', type: 'construction', title: 'باني الشبكة البيئية الصحية', description: 'اربط بين النباتات، الحيوانات، والأمطار لتشكيل نظام بيئي سليم', points: 40, order: 3 }
            ]
        }
    }
];

async function seedEnvironmental() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecolearn';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing versions of these courses to avoid duplicates
        const courseIds = environmentalCourses.map(c => c.courseId);
        await Course.deleteMany({ courseId: { $in: courseIds } });
        console.log('Cleared existing environmental courses if any');

        const inserted = await Course.insertMany(environmentalCourses);
        console.log(`✅ Successfully inserted ${inserted.length} environmental courses`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding environmental courses:', error);
        process.exit(1);
    }
}

seedEnvironmental();
