'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { QueryHistory } from '@/types';

/**
 * Gets the current authenticated user's ID and the supabase client
 */
async function getAuthUserId() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { authUserId: null, supabase };
    return { authUserId: user.id, supabase };
  } catch (err) {
    console.error('Error verifying auth token:', err);
    return { authUserId: null, supabase: null };
  }
}

/**
 * Saves a new query to the history in Supabase
 */
export async function saveQueryHistory(historyItem: QueryHistory, userId: number | string) {
  try {
    const { authUserId, supabase } = await getAuthUserId();
    if (!authUserId || !supabase) throw new Error('Not authenticated');

    const { error } = await supabase.from('query_history').insert({
      id: historyItem.id,
      auth_user_id: authUserId,
      user_id: Number(userId),
      natural_query: historyItem.naturalQuery,
      generated_sql: historyItem.generatedSQL,
      row_count: historyItem.rowCount,
      execution_time: historyItem.executionTime,
      is_favorite: historyItem.isFavorite || false,
      status: historyItem.status || 'success',
      created_at: historyItem.createdAt || new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase query_history insert error:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving query history:', error);
    return { success: false, error: 'Failed to save query history' };
  }
}

/**
 * Fetches the user's query history from Supabase
 */
export async function fetchQueryHistory() {
  try {
    const { authUserId, supabase } = await getAuthUserId();
    if (!authUserId || !supabase) return [];

    const { data, error } = await supabase
      .from('query_history')
      .select('*')
      .eq('auth_user_id', authUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch query_history error:', error);
      throw error;
    }

    // Map database rows back to our frontend QueryHistory type
    const mappedHistory: QueryHistory[] = data.map((row: any) => ({
      id: row.id,
      naturalQuery: row.natural_query,
      generatedSQL: row.generated_sql,
      rowCount: row.row_count,
      executionTime: row.execution_time,
      createdAt: new Date(row.created_at),
      isFavorite: row.is_favorite,
      status: row.status,
      user_id: String(row.user_id),
    }));

    return mappedHistory;
  } catch (error) {
    console.error('Error fetching query history:', error);
    return [];
  }
}

/**
 * Toggles the favorite status of a query in Supabase
 */
export async function toggleQueryFavorite(queryId: string, isFavorite: boolean) {
  try {
    const { authUserId, supabase } = await getAuthUserId();
    if (!authUserId || !supabase) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('query_history')
      .update({ is_favorite: isFavorite })
      .eq('id', queryId)
      .eq('auth_user_id', authUserId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error toggling query favorite:', error);
    return { success: false, error: 'Failed to toggle favorite' };
  }
}

/**
 * Deletes a query from the history in Supabase
 */
export async function deleteQueryHistory(queryId: string) {
  try {
    const { authUserId, supabase } = await getAuthUserId();
    if (!authUserId || !supabase) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('query_history')
      .delete()
      .eq('id', queryId)
      .eq('auth_user_id', authUserId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting query history:', error);
    return { success: false, error: 'Failed to delete query' };
  }
}
