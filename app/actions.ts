'use server'

import { createClient } from '@/lib/supabase/server'

interface AssessmentPayload {
  jabatan: string;
  kecamatan: string;
  institution_id: string; // instansi yang dinilai
  answers: any;
}

// We will not use random string anymore, we will calculate based on count inside submitAssessment

export async function submitAssessment(payload: AssessmentPayload) {
  const supabase = await createClient()

  // Calculate overall score from answers — skip any _metadata keys
  const answerValues = Object.entries(payload.answers)
    .filter(([key]) => !key.startsWith('_metadata'))
    .map(([, val]) => Number(val));
  const sum = answerValues.reduce((acc, val) => acc + val, 0);
  const overall_score = answerValues.length > 0 ? Number((sum / answerValues.length).toFixed(2)) : 0;

  const { count } = await supabase
    .from('survey_responses')
    .select('*', { count: 'exact', head: true });

  const nextNumber = (count || 0) + 1;
  const responseCode = nextNumber.toString().padStart(4, '0');

  const { data, error } = await supabase
    .from('survey_responses')
    .insert({
      response_code: responseCode,
      institution_id: payload.institution_id,
      jabatan: payload.jabatan,
      kecamatan: payload.kecamatan,
      answers: payload.answers,
      overall_score: overall_score
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Submit Error:', error)
    throw new Error('Gagal menyimpan: ' + error.message)
  }

  return { success: true, responseCode }
}
