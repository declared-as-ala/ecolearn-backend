/**
 * Script to delete the Respiratory Safety Course and all associated data
 * 
 * This script will:
 * 1. Delete the course from the database
 * 2. Delete all Progress records related to this course
 * 3. Remove badges associated with this course from users
 * 4. Delete any notifications related to this course
 * 5. Clean up any other related data
 * 
 * Usage: node deleteRespiratoryCourse.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('./models/Course');
const Progress = require('./models/Progress');
const User = require('./models/User');
const Notification = require('./models/Notification');

// Course IDs to delete (both variations)
const COURSE_IDS = [
  'respiratory-system-safety',
  'respiratory-safety-6',
  'respiratory-system-safety-6'
];

// Badge name associated with this course
const COURSE_BADGE = 'بطل الهواء النقي';

async function deleteRespiratoryCourse() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eco-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the course(s) to delete
    const courses = await Course.find({
      $or: [
        { courseId: { $in: COURSE_IDS } },
        { title: 'المحافظة على سلامة الجهاز التنفسي' }
      ]
    });

    if (courses.length === 0) {
      console.log('ℹ️  No courses found to delete. Course may have already been removed.');
      await mongoose.disconnect();
      return;
    }

    console.log(`📋 Found ${courses.length} course(s) to delete:`);
    courses.forEach(course => {
      console.log(`   - ${course.courseId}: ${course.title}`);
    });

    const courseIds = courses.map(c => c._id);
    const courseObjectIds = courses.map(c => c._id.toString());

    // 1. Delete all Progress records related to this course
    const progressDeleted = await Progress.deleteMany({
      course: { $in: courseIds }
    });
    console.log(`✅ Deleted ${progressDeleted.deletedCount} progress records`);

    // 2. Remove badges from users
    const usersWithBadge = await User.find({
      badges: COURSE_BADGE
    });

    if (usersWithBadge.length > 0) {
      const updateResult = await User.updateMany(
        { badges: COURSE_BADGE },
        { $pull: { badges: COURSE_BADGE } }
      );
      console.log(`✅ Removed badge "${COURSE_BADGE}" from ${updateResult.modifiedCount} user(s)`);
    } else {
      console.log(`ℹ️  No users found with badge "${COURSE_BADGE}"`);
    }

    // 3. Delete notifications related to this course
    // Note: Notifications might reference course by title or courseId
    const notificationsDeleted = await Notification.deleteMany({
      $or: [
        { message: { $regex: 'المحافظة على سلامة الجهاز التنفسي', $options: 'i' } },
        { message: { $regex: 'بطل الهواء النقي', $options: 'i' } },
        { relatedTo: { $in: courseObjectIds } }
      ]
    });
    console.log(`✅ Deleted ${notificationsDeleted.deletedCount} notifications`);

    // 4. Delete the course(s) themselves
    const coursesDeleted = await Course.deleteMany({
      _id: { $in: courseIds }
    });
    console.log(`✅ Deleted ${coursesDeleted.deletedCount} course(s)`);

    // 5. Check for any remaining references
    const remainingProgress = await Progress.countDocuments({
      course: { $in: courseIds }
    });

    if (remainingProgress > 0) {
      console.warn(`⚠️  Warning: ${remainingProgress} progress records still reference deleted course(s)`);
    } else {
      console.log('✅ All progress records cleaned up');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Courses deleted: ${coursesDeleted.deletedCount}`);
    console.log(`   - Progress records deleted: ${progressDeleted.deletedCount}`);
    console.log(`   - Badges removed from users: ${usersWithBadge.length}`);
    console.log(`   - Notifications deleted: ${notificationsDeleted.deletedCount}`);
    console.log('\n✅ Course deletion completed successfully!');

  } catch (error) {
    console.error('❌ Error deleting course:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  deleteRespiratoryCourse()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { deleteRespiratoryCourse };

