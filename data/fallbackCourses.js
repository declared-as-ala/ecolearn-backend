// Minimal fallback course templates so API can self-heal when DB is missing data.
// This avoids 404s on course endpoints if the seed script hasn't been run.
// Import courses from seed file
let fallbackCourses = [];
try {
  const { environmentalCourses } = require('../seedEnvironmental');
  fallbackCourses = environmentalCourses || [];
} catch (error) {
  // If seed file can't be loaded, use empty array (will require manual seeding)
  console.warn('⚠️ Could not load course templates from seedEnvironmental.js:', error.message);
}

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




