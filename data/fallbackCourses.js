// Minimal fallback course templates so API can self-heal when DB is missing data.
// This avoids 404s on course endpoints if the seed script hasn't been run.
const fallbackCourses = [
  {
    courseId: 'respiratory-system-safety',
    title: 'المحافظة على سلامة الجهاز التنفسي',
    description: 'السنة السادسة ابتدائي (الوحدة الثانية)',
    gradeLevel: 6,
    order: 1,
    badge: { name: 'بطل الهواء النقي', icon: '🌬️' },
    isActive: true,
    sections: {
      video: { url: '' },
      exercises: [
        { id: 'ex1', type: 'quiz', title: 'اختَر هواءك!', points: 15, order: 1 },
        { id: 'ex2', type: 'decision', title: 'أنفِك يحكي!', points: 20, order: 2 },
        { id: 'ex3', type: 'sticker', title: 'صلّح بيتك ليتنفّس!', points: 25, order: 3 },
      ],
      games: [
        {
          id: 'g1',
          type: 'runner',
          title: 'سباق أنقذ أنفي!',
          description: 'اركض عبر شوارع ملوّثة، اجمع الأوراق 🍃 وتجنّب الدخان 💨',
          points: 35,
          order: 1,
          gameData: {
            collectItems: ['🍃', '🍃', '🍃', '🌿', '🌱'],
            hazardItems: ['💨', '💨', '⚠️'],
            lives: 3,
            timeLimitSec: 35
          }
        },
        {
          id: 'g2',
          type: 'map',
          title: 'مهمة مراقب جودة الهواء',
          description: 'ضع حساسات جودة الهواء على الخريطة في أماكن مهمة 🗺️📍',
          points: 30,
          order: 2,
          gameData: {
            rows: 6,
            cols: 8,
            sensorIcon: '📍',
            sensorsToPlace: 3,
            mapLabel: '🗺️ خريطة المدينة (جودة الهواء)'
          }
        },
        {
          id: 'g3',
          type: 'construction',
          title: 'بناء مدينة أنظف',
          description: 'ابنِ مدينة بوسائل نقل نظيفة، طاقة نظيفة، ومساحات خضراء 🌳⚡🚲',
          points: 35,
          order: 3
        },
      ],
    },
  },
];

const normalizeId = (id = '') => id.toLowerCase().replace(/_/g, '-');

function findCourseTemplate(id) {
  const normalized = normalizeId(id);
  return fallbackCourses.find(
    (course) =>
      course.courseId === id ||
      course.courseId === normalized ||
      normalizeId(course.courseId) === normalized
  );
}

module.exports = { fallbackCourses, findCourseTemplate };



