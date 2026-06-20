'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { Report } from '@/types';

/**
 * Saves a new report metadata to the Supabase database.
 * The lightweight metadata and charts are stored in the database row.
 */
export async function saveReportAction(report: Report) {
  try {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('You must be logged in to save a report.');
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('Authentication required to save report.');
    }

    // Prepare lightweight report data for the JSONB column
    const lightweightReport = { ...report };
    delete lightweightReport.rawData; // We remove the massive array
    // Also remove the data from table sections to keep it lightweight
    lightweightReport.sections = lightweightReport.sections.map((sec) => {
      if (sec.type === 'table') {
        return { ...sec, data: [] };
      }
      return sec;
    });

    // 2. Insert the lightweight report metadata into the database
    const { error: dbError } = await supabase.from('reports').insert({
      id: report.id,
      auth_user_id: authData.user.id,
      user_id: user.user_id,
      title: report.title,
      description: report.description,
      report_type: report.reportType,
      report_data: lightweightReport,
      raw_data_url: null, // No bucket storage
    });

    if (dbError) {
      console.error('[DB ERROR]', dbError);
      throw new Error(`Failed to save report metadata: ${dbError.message}`);
    }

    return { success: true, message: 'Report saved securely.' };
  } catch (error) {
    console.error('Error in saveReportAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Fetches all reports belonging to the current user (metadata only).
 */
export async function getReportsAction() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      throw new Error('You must be logged in to view reports.');
    }

    // Thanks to RLS, we just select everything and Supabase filters by auth_user_id
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    // Map database rows back to the Report interface
    const formattedReports: Report[] = data.map((row) => ({
      ...row.report_data,
      id: row.id,
      createdAt: row.created_at,
    }));

    return { success: true, reports: formattedReports };
  } catch (error) {
    console.error('Error in getReportsAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred', reports: [] };
  }
}



/**
 * Deletes a report and its associated raw data from storage.
 */
export async function deleteReportAction(reportId: string, rawDataUrl?: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Delete from database (RLS ensures they can only delete their own)
    const { error: dbError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (dbError) {
      throw new Error(`Failed to delete report: ${dbError.message}`);
    }

    // 2. If there's an associated storage file, delete it
    if (rawDataUrl) {
      const { error: storageError } = await supabase.storage
        .from('report-data')
        .remove([rawDataUrl]);

      if (storageError) {
        console.warn('Could not delete storage file, but DB row was deleted:', storageError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteReportAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}
