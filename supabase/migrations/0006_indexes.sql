-- Migration 0006: Indexes
-- ======================

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_user_updated ON projects(user_id, updated_at DESC);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_projects_user_folder ON projects(user_id, folder_id);
CREATE INDEX idx_projects_user_favorite ON projects(user_id, is_favorite);
CREATE INDEX idx_projects_template ON projects(template_id);

CREATE INDEX idx_slides_project_pos ON slides(project_id, position);
CREATE INDEX idx_slides_user_id ON slides(user_id);

CREATE INDEX idx_folders_user_id ON folders(user_id);

CREATE INDEX idx_fav_templates_user ON favorite_templates(user_id);

CREATE INDEX idx_exports_user_created ON export_records(user_id, created_at DESC);
CREATE INDEX idx_exports_project ON export_records(project_id);

CREATE INDEX idx_genjobs_user_created ON generation_jobs(user_id, created_at DESC);
CREATE INDEX idx_genjobs_project ON generation_jobs(project_id);
CREATE INDEX idx_genjobs_status ON generation_jobs(status);
