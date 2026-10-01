import { supabase } from "../lib/supabase.js";

const COLUMNS = [
  "id",
  "full_name",
  "email",
  "phone",
  "city",
  "birth_date",
  "professions",
  "profession_other",
  "university",
  "department",
  "graduation_year",
  "postgraduate",
  "workplace",
  "experience",
  "practice_areas",
  "diploma_path",
  "certificate_path",
  "purposes",
  "purpose_other",
  "heard_from",
  "heard_other",
  "motivation",
  "created_at"
].join(", ");

export async function fetchSpecialistApplications(limit = 200) {
  const { data, error } = await supabase
    .from("specialist_applications")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getSpecialistDocumentUrl(path) {
  const { data, error } = await supabase.storage.from("specialist-documents").createSignedUrl(path, 60 * 15);
  if (error) throw error;
  return data.signedUrl;
}
