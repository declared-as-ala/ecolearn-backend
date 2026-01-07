// Minimal fallback course templates so API can self-heal when DB is missing data.
// This avoids 404s on course endpoints if the seed script hasn't been run.
const fallbackCourses = [];

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




