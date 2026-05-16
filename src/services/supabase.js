import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://zcyjezqakmhhskcmoevi.supabase.co";
const supabaseKey = "sb_publishable_4qJ-IdLUdTe6_udnIOUJyw_zMMbFWUB";
const supabase = createClient(supabaseUrl, supabaseKey);

// export supabase client
export default supabase;
