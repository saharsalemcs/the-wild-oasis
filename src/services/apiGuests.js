import supabase from "./supabase";

export async function getGuests() {
  const { data, error } = await supabase
    .from("guests")
    .select("id, fullName, email, nationalID, nationality, countryFlag")
    .order("fullName");

  if (error) throw new Error("Guests could not be loaded");
  return data;
}

export async function createGuest(newGuest) {
  const { data, error } = await supabase
    .from("guests")
    .insert([{ ...newGuest }])
    .select()
    .single();

  if (error) throw new Error("Guest could not be created");
  return data;
}
