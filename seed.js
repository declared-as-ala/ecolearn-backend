const mongoose = require('mongoose');
require('dotenv').config();

const Lesson = require('./models/Lesson');
const Game = require('./models/Game');
const Course = require('./models/Course');

// Sample Lessons (Legacy)
const lessons = [
  {
    title: "Introduction to Recycling",
    description: "Learn the basics of recycling and why it's important for our planet",
    content: `
      <h2>What is Recycling?</h2>
      <p>Recycling is the process of converting waste materials into new materials and objects. It helps reduce the consumption of fresh raw materials, energy usage, air pollution, and water pollution.</p>
      
      <h3>Why Recycle?</h3>
      <ul>
        <li>Reduces waste in landfills</li>
        <li>Conserves natural resources</li>
        <li>Saves energy</li>
        <li>Protects wildlife</li>
        <li>Reduces pollution</li>
      </ul>
      
      <h3>What Can Be Recycled?</h3>
      <p>Common recyclable materials include:</p>
      <ul>
        <li>Paper and cardboard</li>
        <li>Plastic bottles and containers</li>
        <li>Glass bottles and jars</li>
        <li>Metal cans</li>
        <li>Electronics</li>
      </ul>
      
      <h3>How to Start Recycling</h3>
      <p>Start by setting up separate bins for different materials at home. Make sure to clean items before recycling them!</p>
    `,
    videoUrl: "https://www.youtube.com/embed/BxKfpt70rLI",
    category: "recycling",
    difficulty: "beginner",
    duration: 10,
    points: 20,
    order: 1,
    isActive: true
  },
  {
    title: "Water Conservation",
    description: "Discover ways to save water and protect this precious resource",
    content: `
      <h2>Why Save Water?</h2>
      <p>Water is essential for all life on Earth. Even though 70% of our planet is covered in water, only 1% is fresh water that we can use!</p>
      
      <h3>Simple Ways to Save Water</h3>
      <ul>
        <li>Turn off the tap while brushing your teeth</li>
        <li>Take shorter showers</li>
        <li>Fix leaky faucets</li>
        <li>Use a bucket instead of a hose to wash the car</li>
        <li>Collect rainwater for plants</li>
      </ul>
      
      <h3>Water Facts</h3>
      <ul>
        <li>A dripping faucet can waste 3,000 gallons per year</li>
        <li>Taking a 5-minute shower uses about 10-25 gallons</li>
        <li>Washing dishes by hand uses more water than a dishwasher</li>
      </ul>
      
      <h3>Your Impact</h3>
      <p>Every drop counts! By saving water, you're helping ensure there's enough for everyone, including plants and animals.</p>
    `,
    videoUrl: "https://www.youtube.com/embed/oW-iuvNn3g4",
    category: "water",
    difficulty: "beginner",
    duration: 12,
    points: 20,
    order: 2,
    isActive: true
  },
  {
    title: "Renewable Energy",
    description: "Learn about solar, wind, and other clean energy sources",
    content: `
      <h2>What is Renewable Energy?</h2>
      <p>Renewable energy comes from natural sources that are constantly replenished, like sunlight, wind, and water. Unlike fossil fuels, renewable energy doesn't run out!</p>
      
      <h3>Types of Renewable Energy</h3>
      <ul>
        <li><strong>Solar Energy:</strong> Energy from the sun, captured using solar panels</li>
        <li><strong>Wind Energy:</strong> Energy from wind, captured using wind turbines</li>
        <li><strong>Hydroelectric Energy:</strong> Energy from flowing water</li>
        <li><strong>Geothermal Energy:</strong> Energy from heat inside the Earth</li>
      </ul>
      
      <h3>Why Renewable Energy?</h3>
      <ul>
        <li>Doesn't pollute the air</li>
        <li>Reduces greenhouse gases</li>
        <li>Creates jobs</li>
        <li>Never runs out</li>
      </ul>
      
      <h3>What You Can Do</h3>
      <p>Even as a kid, you can help! Turn off lights when not needed, use natural light during the day, and encourage your family to use energy-efficient appliances.</p>
    `,
    videoUrl: "https://www.youtube.com/embed/1kUE0BZtTRc",
    category: "energy",
    difficulty: "intermediate",
    duration: 15,
    points: 30,
    order: 3,
    isActive: true
  }
];

// Sample Games (Legacy)
const games = [
  {
    title: "Recycling Quiz",
    description: "Test your knowledge about recycling!",
    type: "quiz",
    category: "recycling",
    difficulty: "beginner",
    gameData: {
      questions: [
        {
          question: "Which of these items can be recycled?",
          options: ["Plastic bottle", "Used tissue", "Food scraps", "Broken glass"],
          correctAnswer: 0,
          explanation: "Plastic bottles can be recycled! Make sure to rinse them first."
        },
        {
          question: "What should you do before recycling a container?",
          options: ["Throw it away", "Rinse it clean", "Break it", "Nothing"],
          correctAnswer: 1,
          explanation: "Always rinse containers before recycling to prevent contamination."
        }
      ]
    },
    points: 25,
    timeLimit: 0,
    isActive: true
  }
];

// Environmental Courses (New System)
const environmentalCourses = [
  // --- Grade 5 ---
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
        {
          id: 'ex1_1',
          type: 'drag-sequence',
          title: 'ترتيب السلسلة الغذائية (1)',
          points: 10,
          order: 1,
          content: {
            prompt: 'رتب الكائنات لتكوين سلسلة غذائية صحيحة 🌿🐀🦉🦅',
            items: [
              { id: 'plant', label: 'نبات', emoji: '🌿' },
              { id: 'mouse', label: 'فأر', emoji: '🐀' },
              { id: 'owl', label: 'بوم', emoji: '🦉' },
              { id: 'hawk', label: 'صقر', emoji: '🦅' },
            ],
            correctOrder: ['plant', 'mouse', 'owl', 'hawk'],
            successMessage: 'ممتاز! أنت حامي التوازن البيئي لكل سلسلة 🌿',
            errorMessage: 'حاول مجددًا 🌱',
            rewardBadge: { name: 'حامي السلسلة 1', icon: '🥇' },
          },
        },
        {
          id: 'ex1_2',
          type: 'drag-sequence',
          title: 'ترتيب السلسلة الغذائية (2)',
          points: 10,
          order: 2,
          content: {
            prompt: 'رتب الكائنات لتكوين سلسلة غذائية صحيحة 🌸🐝🐦🐱',
            items: [
              { id: 'flower', label: 'زهرة', emoji: '🌸' },
              { id: 'bee', label: 'نحلة', emoji: '🐝' },
              { id: 'bird', label: 'طائر', emoji: '🐦' },
              { id: 'cat', label: 'قط', emoji: '🐱' },
            ],
            correctOrder: ['flower', 'bee', 'bird', 'cat'],
            successMessage: 'ممتاز! أنت حامي التوازن البيئي لكل سلسلة 🌿',
            errorMessage: 'حاول مجددًا 🌱',
            rewardBadge: { name: 'حامي السلسلة 2', icon: '🥈' },
          },
        },
        {
          id: 'ex1_3',
          type: 'drag-sequence',
          title: 'ترتيب السلسلة الغذائية (3)',
          points: 10,
          order: 3,
          content: {
            prompt: 'رتب الكائنات لتكوين سلسلة غذائية صحيحة 🌿🦗🐸🐍',
            items: [
              { id: 'green_plant', label: 'نبات أخضر', emoji: '🌿' },
              { id: 'locust', label: 'جرادة', emoji: '🦗' },
              { id: 'frog', label: 'ضفدع', emoji: '🐸' },
              { id: 'snake', label: 'ثعبان', emoji: '🐍' },
            ],
            correctOrder: ['green_plant', 'locust', 'frog', 'snake'],
            successMessage: 'ممتاز! أنت حامي التوازن البيئي لكل سلسلة 🌿',
            errorMessage: 'حاول مجددًا 🌱',
            rewardBadge: { name: 'حامي السلسلة 3', icon: '🥉' },
          },
        },
        {
          id: 'ex2',
          type: 'mcq-set',
          title: 'أدوار الكائنات الحية',
          points: 20,
          order: 4,
          content: {
            prompt: 'أجب عن الأسئلة التالية لفهم أدوار الكائنات في الطبيعة 🌍',
            questions: [
              {
                id: 'q1',
                question: 'من يتغذى مباشرة على النبات الأخضر؟',
                options: ['الفأر', 'البوم', 'الصقر'],
                correct: 'الفأر',
              },
              {
                id: 'q2',
                question: 'من هم المفككون؟',
                options: ['البكتيريا والفطريات', 'الفأر', 'البوم'],
                correct: 'البكتيريا والفطريات',
              },
              {
                id: 'q3',
                question: 'إذا اختفت النباتات، ماذا يحدث؟',
                options: ['الحيوانات العاشبة تتأثر', 'لا شيء', 'الحيوانات اللاحمة تأكل النباتات مباشرة'],
                correct: 'الحيوانات العاشبة تتأثر',
              },
            ],
            successMessage: 'رائع! كل إجابة صحيحة تقربك من فهم أسرار الطبيعة 🐭',
            errorMessage: 'لا تقلق! ركّز على الكائنات وستفهم العلاقة بينهم 🌿',
            rewardBadge: { name: 'محقق الطبيعة الصغير', icon: '🕵️‍♂️' },
          },
        },
        {
          id: 'ex3',
          type: 'scenario',
          title: 'سلوك بيئي مسؤول',
          points: 20,
          order: 5,
          content: {
            prompt: 'رأيت أشخاصاً يقطعون النباتات في الحقل. ماذا تفعل؟ 🌳',
            scenario: 'أنت في نزهة ورأيت مجموعة من الناس يقطفون الزهور ويقطعون شجيرات صغيرة.',
            options: [
              'حماية النباتات (أنصحهم بالتوقف بلطف) ✅',
              'تجاهل الوضع',
              'أخذ النباتات لنفسك',
            ],
            correct: 'حماية النباتات (أنصحهم بالتوقف بلطف) ✅',
            successMessage: 'أحسنت! اختيارك يحمي حياة الحيوانات والنباتات 🕊️',
            errorMessage: 'توقف! فكر في العواقب على الوسط البيئي 🌍',
            rewardBadge: { name: 'صديق الحقول والطبيعة', icon: '🕊️' },
          },
        },
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

  // --- Grade 6 ---
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
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecolearn';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Lesson.deleteMany({});
    await Game.deleteMany({});
    await Course.deleteMany({});
    console.log('Cleared existing lessons, games, and courses');

    // Insert lessons
    const insertedLessons = await Lesson.insertMany(lessons);
    console.log(`✅ Inserted ${insertedLessons.length} lessons`);

    // Insert games
    const insertedGames = await Game.insertMany(games);
    console.log(`✅ Inserted ${insertedGames.length} games`);

    // Insert courses
    const insertedCourses = await Course.insertMany(environmentalCourses);
    console.log(`✅ Inserted ${insertedCourses.length} environmental courses`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
