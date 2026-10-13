const path = require('path');
require('./backend/node_modules/dotenv').config({ path: path.join(__dirname, 'backend/.env') });
const db = require('./backend/db.js');

async function checkUsers() {
  try {
    const [rows] = await db.query(
      'SELECT user_id, full_name, email, branch, college, graduation_year FROM users ORDER BY user_id DESC LIMIT 20;'
    );
    console.log('\n======================================================');
    console.log('📊 SkillTwin AI — MySQL Database Sync Report');
    console.log('======================================================');
    console.log(`✅ Total registered users found: ${rows.length}\n`);
    if (rows.length > 0) {
      console.table(rows);
    } else {
      console.log('ℹ️ No users registered yet in the database.');
    }
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Could not connect to database:', err.message);
    process.exit(1);
  }
}

checkUsers();
