const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log("Checking recurring columns:");
  const { data: recData } = await supabase.from('recurring').insert({ id: 'rec-test-' + Date.now(), name: 'Test Rec' }).select();
  console.log("Recurring columns:", recData);
  if (recData && recData.length > 0) {
    await supabase.from('recurring').delete().eq('id', recData[0].id);
  }

  console.log("Checking debts columns:");
  const { data: debtData } = await supabase.from('debts').insert({ id: 'd-test-' + Date.now(), name: 'Test Debt' }).select();
  console.log("Debts columns:", debtData);
  if (debtData && debtData.length > 0) {
    await supabase.from('debts').delete().eq('id', debtData[0].id);
  }
}

test();
