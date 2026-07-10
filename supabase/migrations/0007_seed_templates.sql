-- Migration 0007: Seed Templates and Palettes
-- ===========================================

INSERT INTO templates (slug, name_ar, description_ar, component_key, sort_order, supported_sizes, supported_fonts) VALUES
  ('tahrir',  'تحرير',  'تصميم تحريري بأرقام كبيرة وتباين واضح',  'tahrir',  1,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('wadeh',   'واضح',   'تصميم نظيف بمساحات واسعة وخط واضح',        'wadeh',   2,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('noqta',   'نقطة',   'نقطة بصرية مركزية مع عنوان بارز',          'noqta',   3,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('itar',    'إطار',   'إطار زخرفي حول المحتوى مع خلفية ناعمة',     'itar',    4,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('mujaz',   'موجز',   'تصميم مختصر بكتلة نصية متمركزة',           'mujaz',   5,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('academy', 'أكاديمي','تصميم منظم بشريط جانبي وأرقام',             'academy', 6,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('hadith',  'حديث',   'تصميم عصري بأشكال هندسية وزوايا',           'hadith',  7,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('tabayun', 'تباين',  'تباين قوي بين النص والخلفية مع شريط ملوّن', 'tabayun', 8,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('shabaka', 'شبكة',   'تصميم بخلفية شبكية وعناصر منظمة',           'shabaka', 9,  ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('unwan',   'عنوان',  'عنوان ضخم يملأ المساحة مع تفاصيل دقيقة',    'unwan',   10, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'])
ON CONFLICT (slug) DO NOTHING;

-- ============ Palettes for each template ============
-- Insert 4 palettes per template (same 4 palette themes across all templates)
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, p.name_ar, p.bg, p.txt, p.acc, p.sec, p.sort_order
FROM templates t
CROSS JOIN (VALUES
  ('مكمّل',  '#FAFAF9', '#1C1917', '#6D5EFC', '#E8E6FE', 1),
  ('ليلي',   '#1E1B2E', '#F5F3FF', '#A78BFA', '#3B3258', 2),
  ('رمادي',  '#F5F5F4', '#1C1917', '#44403C', '#D6D3D1', 3),
  ('مرجاني', '#FFF5F3', '#7C2D12', '#F97316', '#FFEDD5', 4)
) AS p(name_ar, bg, txt, acc, sec, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id
);
