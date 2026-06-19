'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { Report } from '@/types';

/**
 * Saves a new report to the Supabase database.
 * The rawData is uploaded as a JSON file to the storage bucket.
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

    // 1. Upload raw data to Storage Bucket
    const fileName = `${authData.user.id}/${report.id}.json`;
    const rawDataJson = JSON.stringify(report.rawData || []);

    const { error: storageError } = await supabase.storage
      .from('report-data')
      .upload(fileName, rawDataJson, {
        contentType: 'application/json',
        upsert: true,
      });

    if (storageError) {
      console.error('[STORAGE ERROR]', storageError);
      throw new Error(`Failed to upload raw data: ${storageError.message}`);
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
      raw_data_url: fileName, // Save the path so we can fetch it later
    });

    if (dbError) {
      console.error('[DB ERROR]', dbError);
      // Attempt to clean up storage if DB insert fails
      await supabase.storage.from('report-data').remove([fileName]);
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
 * Fetches the raw data JSON for a specific report from the Storage Bucket.
 */
export async function getReportRawDataAction(reportId: string, rawDataUrl: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      throw new Error('You must be logged in to view this report data.');
    }

    // Download the JSON file from storage
    const { data, error } = await supabase.storage
      .from('report-data')
      .download(rawDataUrl);

    if (error) {
      throw new Error(`Failed to download raw data: ${error.message}`);
    }

    // Parse the file contents
    const text = await data.text();
    const rawData = JSON.parse(text);

    return { success: true, rawData };
  } catch (error) {
    console.error('Error in getReportRawDataAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred', rawData: [] };
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
