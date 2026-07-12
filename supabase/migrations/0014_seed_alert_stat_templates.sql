-- Migration 0014: Seed 2 New Medical Templates (tahdheer, raqmi)
-- ========================================================
-- Templates: tahdheer (alert/warning), raqmi (stat card)
-- Added to frontend TEMPLATE_DEFS (src/lib/templates.ts) and slide-renderer.tsx.
-- Must be inserted into templates table or selecting them in the editor
-- silently fails to save (same issue fixed for the 0013 batch).
-- Each with 4 style-specific palettes (8 palette rows total).

INSERT INTO templates (slug, name_ar, description_ar, component_key, sort_order, supported_sizes, supported_fonts, category) VALUES
  ('tahdheer', 'تحذير', 'تصميم تنبيهي لأعراض الخطر وحالات استشارة الطبيب العاجلة', 'tahdheer', 26, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'], 'medical'),
  ('raqmi',    'رقمي',  'تصميم إحصائي برقم كبير وخلفية متدرجة لعرض الأرقام والدراسات', 'raqmi',    27, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'], 'medical')
ON CONFLICT (slug) DO NOTHING;

-- ============ Palettes ============

-- tahdheer
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('كهرماني','#FFFBEB','#451A03','#D97706','#FEF3C7',1),
  ('أحمر تحذيري','#FEF2F2','#450A0A','#DC2626','#FEE2E2',2),
  ('داكن','#1C1410','#FDE9CE','#F59E0B','#2B2016',3),
  ('محايد','#FAFAF9','#1C1917','#B91C1C','#F5F5F4',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'tahdheer'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- raqmi
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('بنفسجي','#F5F3FF','#2E1065','#7C3AED','#EDE9FE',1),
  ('أزرق','#EFF6FF','#1E3A5F','#2563EB','#DBEAFE',2),
  ('أخضر','#ECFDF5','#064E3B','#059669','#D1FAE5',3),
  ('داكن','#18181B','#F4F4F5','#A78BFA','#27272A',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'raqmi'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);
