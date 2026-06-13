import { getToday } from "../utils/helpers";
import supabase from "./supabase";
import { PER_PAGE } from "../utils/config";

export async function getBookings({ filter, sortBy, page }) {
  let query = supabase
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, totalPrice,hasBreakfast, isPaid, status, cabins(id, name), guests(id, fullName, email)",
      { count: "exact" },
    );

  // FILTER
  if (filter) {
    // dynamic method access
    query = query[filter.method || "eq"](filter.field, filter.value);
  }

  // SORTING
  if (sortBy) {
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === "asc",
    });
  }

  // PAGINATION
  if (page) {
    const from = (page - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;

    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("bookings could not be loaded");
  }

  return { data, error, count };
}

export async function getBooking(id) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, cabins(*), guests(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking not found");
  }
  return data;
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
export async function getBookingsAfterDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("created_at, totalPrice, extrasPrice")
    .gte("created_at", date)
    .lte("created_at", getToday({ end: true }));

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Returns all STAYS that are were created after the given date
export async function getStaysAfterDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    // .select('*')
    .select("*, guests(fullName)")
    .gte("startDate", date)
    .lte("startDate", getToday());

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Activity means that there is a check in or a check out today
export async function getStaysTodayActivity() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(fullName, nationality, countryFlag)")
    .or(
      `and(status.eq.unconfirmed,startDate.eq.${getToday()}),and(status.eq.checked-in,endDate.eq.${getToday()})`,
    )
    .order("created_at");

  /*
    (
  status = 'unconfirmed'
  AND
  startDate = today
)
OR
(
  status = 'checked-in'
  AND
  endDate = today
)*/

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }
  return data;
}

export async function updateBooking(newBookingData, id) {
  const { data, error } = await supabase
    .from("bookings")
    .update(newBookingData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  return data;
}

export async function deleteBooking(id) {
  // REMEMBER RLS POLICIES
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) throw new Error("Booking could not be deleted");

  return data;
}

// Check Cabin Availability
export async function checkForOverlappingBookings(cabinId, startDate, endDate) {
  let query = supabase
    .from("bookings")
    .select("id")
    .not("status", "eq", "checked-out")
    .eq("cabinId", cabinId)
    .lte("startDate", endDate)
    .gte("endDate", startDate);

  const { data, error } = await query;

  if (error) throw new Error("Failed to check for overlapping bookings");

  return data.length > 0; // كدا فيه حجوزات موجودة بالفعل
}

export async function createBooking(newBooking) {
  // Check Cabin Availability
  const { cabinId, startDate, endDate } = newBooking;
  const hasOverlapping = await checkForOverlappingBookings(
    cabinId,
    startDate,
    endDate,
  );

  if (hasOverlapping)
    throw new Error("This cabin is already booked for these days");

  const { data, error } = await supabase
    .from("bookings")
    .insert([{ ...newBooking }])
    .select();

  if (error) {
    console.log("Supabase error details:", error);
    throw new Error("Booking could not be added");
  }

  return data;
}
