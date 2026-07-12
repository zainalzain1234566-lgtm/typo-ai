-- Free general-purpose Technical Blueprint template.

INSERT INTO templates (
  slug, name_ar, description_ar, component_key, sort_order,
  supported_sizes, supported_fonts, category
) VALUES (
  'engineering', 'هندسي', 'مخطط هندسي بخلفية شبكية وخطوط قياس تقنية',
  'engineering', 28,
  ARRAY['square','portrait','story'],
  ARRAY['tajawal','cairo','ibm-plex-sans-arabic'],
  'general'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO template_palettes (
  template_id, name_ar, background_color, text_color,
  accent_color, secondary_color, sort_order
)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('مخطط كحلي','#0D2B4A','#F5FBFF','#63C6FF','#173F66',1),
  ('ورق هندسي','#F4F9FC','#13324A','#1976A8','#DCECF5',2),
  ('فحمي سماوي','#151A1F','#EFF7FA','#38BDF8','#26333D',3),
  ('كوبالت أبيض','#123B6D','#FFFFFF','#A8E4FF','#1D518F',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'engineering'
AND NOT EXISTS (
  SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id
);
