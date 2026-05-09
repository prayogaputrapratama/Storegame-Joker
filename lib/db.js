import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function saveTransaction(data) {
  const { error } = await supabase.from('transactions').insert(data);
  if (error) throw error;
}

export async function updateTransaction({ ref_id, ...updates }) {
  const { error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('ref_id', ref_id);
  if (error) throw error;
}

export { supabase };
