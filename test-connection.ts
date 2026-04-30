import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhnimhnafkhbdqqknrxl.supabase.co';
const supabaseKey = 'sb_publishable_mZ-Q4Itsh9ZQSVFVxmDMOA_5PUJvBmu';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    const { data, error } = await supabase.from('bookings').select('count');

    if (error) {
      console.error('❌ Connection error:', error.message);
      console.log('\n⚠️  Make sure you have created the tables in Supabase!');
      console.log('Run the SQL commands from SETUP_GUIDE.md in your Supabase SQL Editor\n');
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('✅ Bookings table is accessible\n');
    }

    const { error: usersError } = await supabase.from('users').select('count');

    if (usersError) {
      console.error('⚠️  Users table not found or not accessible');
      console.log('Make sure to run the SQL setup from SETUP_GUIDE.md\n');
    } else {
      console.log('✅ Users table is accessible\n');
    }

    console.log('📋 Next steps:');
    console.log('1. Make sure you ran the SQL setup from SETUP_GUIDE.md');
    console.log('2. Create an admin user in Supabase Authentication');
    console.log('3. Add the user to the users table with admin role');
    console.log('4. Start the app and login!\n');

  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection();
