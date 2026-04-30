import { supabase } from './supabase';

interface BookingData {
  client_name: string;
  phone: string;
  cnic: string;
  total_amount: number;
  check_in: string;
}

export async function trackGuest(bookingData: BookingData): Promise<string | null> {
  try {
    // Check if guest exists by phone
    const { data: existingGuest, error: fetchError } = await supabase
      .from('guests')
      .select('*')
      .eq('phone', bookingData.phone)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching guest:', fetchError);
      return null;
    }

    if (existingGuest) {
      // Update existing guest
      const { data: updatedGuest, error: updateError } = await supabase
        .from('guests')
        .update({
          total_bookings: existingGuest.total_bookings + 1,
          total_spent: existingGuest.total_spent + bookingData.total_amount,
          last_visit_date: bookingData.check_in,
          // Auto-upgrade to VIP if they have 5+ bookings or spent 100k+
          is_vip: existingGuest.total_bookings + 1 >= 5 || existingGuest.total_spent + bookingData.total_amount >= 100000,
        })
        .eq('id', existingGuest.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating guest:', updateError);
        return null;
      }

      return updatedGuest.id;
    } else {
      // Create new guest
      const { data: newGuest, error: insertError } = await supabase
        .from('guests')
        .insert([
          {
            name: bookingData.client_name,
            phone: bookingData.phone,
            cnic: bookingData.cnic,
            total_bookings: 1,
            total_spent: bookingData.total_amount,
            last_visit_date: bookingData.check_in,
            is_vip: false,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating guest:', insertError);
        return null;
      }

      return newGuest.id;
    }
  } catch (error) {
    console.error('Error in trackGuest:', error);
    return null;
  }
}

export async function logAudit(action: string, tableName: string, recordId: string, userId?: string, userName?: string, oldData?: any, newData?: any) {
  try {
    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        user_name: userName,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData,
        new_data: newData,
      },
    ]);
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}
