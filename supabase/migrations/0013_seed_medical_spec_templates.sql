-- Migration 0013: Seed 5 Missing Medical Spec Templates
-- ========================================================
-- Templates: clinical-clean, numbered-steps, myth-fact, editorial-health, bold-statement
-- These exist in the frontend TEMPLATE_DEFS (src/lib/templates.ts) but were never
-- inserted into the templates table, causing selecting them in the editor to
-- silently fail to save (projectToUpdateInput/projectToCreateInput bail with null
-- when the slug isn't found in the DB lookup).
-- Each with 4 style-specific palettes (20 palette rows total).

INSERT INTO templates (slug, name_ar, description_ar, component_key, sort_order, supported_sizes, supported_fonts, category) VALUES
  ('clinical-clean',   'طببي نظيف',      'تصميم مؤسسي نظيف وموثوق بمساحات واسعة وخطوط رفيعة',                  'clinical-clean',   21, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'], 'medical'),
  ('numbered-steps',   'خطوات مرقمة',    'أرقام كبيرة كمرساة بصرية لخطوات وإجراءات قابلة للتنفيذ',              'numbered-steps',   22, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'], 'medical'),
  ('myth-fact',        'خرافة وحقيقة',   'نظام بصري لتفكيك الخرافات بإشارات صح والخطأ المتضادة',                'myth-fact',        23, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'], 'medical'),
  ('editorial-health',  'صحي تحريري',     'تصميم مجلات دافئ بصفحات راقية ومحتوى إنساني',                         'editorial-health', 24, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'], 'medical'),
  ('bold-statement',   'بيان جريء',      'تباين عالي ورسالة واحدة قوية في كل شريحة',                            'bold-statement',   25, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'], 'medical')
ON CONFLICT (slug) DO NOTHING;

-- ============ Palettes ============

-- clinical-clean
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('أزرق طبي','#FFFFFF','#0F2A3F','#2E86C1','#6B7C8C',1),
  ('أخضر ناعم','#F7FAFC','#14342B','#2E9E7B','#5E7A72',2),
  ('كحلي هادئ','#FFFFFF','#1A1A2E','#4A5CC7','#7A7F99',3),
  ('محايد دافئ','#FBF9F6','#2B2B2B','#C0392B','#8A7F7A',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'clinical-clean'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- numbered-steps
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('أزرق','#FFFFFF','#14213D','#2E86C1','#DCEBF7',1),
  ('أخضر','#F6FBF9','#12312A','#17A398','#D2EFE9',2),
  ('برتقالي','#FFF8F0','#2B1E12','#E67E22','#FBE7D0',3),
  ('داكن','#1A1A2E','#EDEDF5','#7C83FD','#2E2E52',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'numbered-steps'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- myth-fact
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('أبيض','#FFFFFF','#1B1B1B','#E74C3C','#27AE60',1),
  ('وردي ناعم','#FDF6F5','#2A1A1A','#D64545','#2E9E7B',2),
  ('داكن','#0F1626','#F2F4F8','#FF6B6B','#4ADE80',3),
  ('تركواز','#F7F9FC','#16324F','#E4572E','#17A398',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'myth-fact'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- editorial-health
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('رملي دافئ','#FBF7F0','#2E2A26','#C77D4A','#F0E6D8',1),
  ('أخضر مريمي','#F4F8F5','#23342B','#5A8F6E','#E1EDE5',2),
  ('وردي ناعم','#FFF6F5','#3A2A2A','#D98A8A','#F6E4E4',3),
  ('تحريري داكن','#20242B','#EDE9E3','#E0A458','#2C3138',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'editorial-health'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- bold-statement
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('ذهبي داكن','#0E1116','#FFFFFF','#FFD166','#1a1d24',1),
  ('أزرق كامل','#2E86C1','#FFFFFF','#0B3D5C','#2563a0',2),
  ('أبيض وأحمر','#F2F4F8','#14213D','#E63946','#dfe3ec',3),
  ('أخضر عميق','#16302B','#EAF4EF','#2CC28E','#1a3f37',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'bold-statement'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);
