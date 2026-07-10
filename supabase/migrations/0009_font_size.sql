-- Migration 0009: Add font_size_scale to projects
-- Allows users to scale all text on slides proportionally

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS font_size_scale real NOT NULL DEFAULT 1.0
    CHECK (font_size_scale BETWEEN 0.7 AND 1.5);
