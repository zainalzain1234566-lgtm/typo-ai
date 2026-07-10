const MEDICAL_MODE = process.env.NEXT_PUBLIC_MEDICAL_MODE !== "false";

export const FEATURE_FLAGS = {
  medicalMode: MEDICAL_MODE,
  folders: !MEDICAL_MODE,
  favorites: !MEDICAL_MODE,
  stats: !MEDICAL_MODE,
  duplicateProject: !MEDICAL_MODE,
  extraSizes: !MEDICAL_MODE,
};
