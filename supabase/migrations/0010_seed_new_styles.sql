-- Migration 0010: Seed 10 New Style Templates
-- ===========================================
-- Templates: hero, editorial, split, stacked, cards, rotated, terminal, magazine, tilt, retro
-- Each with 4 style-specific palettes (40 palette rows total)

INSERT INTO templates (slug, name_ar, description_ar, component_key, sort_order, supported_sizes, supported_fonts) VALUES
  ('hero',      'بطل',     'تصميم مركزي بأرقام شفافة وتباين أبيض/أسود',      'hero',      11, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('editorial', 'تحريري',  'تصميم تحريري بخط سيريف وألوان كريمي/ذهبي',        'editorial', 12, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('split',     'انقسام',  'لوحة منقسمة بلون ملوّن ولوحة جانبية',              'split',     13, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('stacked',   'مكدّس',   'تصميم مكدّس أسفل بألوان وردية ناعمة',               'stacked',   14, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('cards',     'بطاقات',  'شبكة بطاقات بألوان خضراء وعناصر مرتبة',            'cards',     15, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('rotated',   'مائل',    'تصميم مائل بظلال صلبة وألوان مرجانية',              'rotated',   16, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('terminal',  'برمجي',   'تصميم طرفية سوداء بأخضر نيون وخط أحادي',           'terminal',  17, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('magazine',  'مجلة',    'أعمدة مجلية بخط الآلة الكاتبة وإطار متقطع',        'magazine',  18, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('tilt',      'قطري',    'تصميم مائل قطريًا بخلفية متدرجة وزجاجية',           'tilt',      19, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic']),
  ('retro',     'ريترو',   'تصميم تسعينيات بخطوط قطرية وظلال صلبة',             'retro',     20, ARRAY['square','portrait','story'], ARRAY['tajawal','cairo','ibm-plex-sans-arabic'])
ON CONFLICT (slug) DO NOTHING;

-- ============ Palettes ============

-- hero
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('أبيض','#ffffff','#111111','#111111','#f5f5f5',1),
  ('ليلي','#111111','#ffffff','#ffffff','#1a1a1a',2),
  ('كريمي','#faf3e0','#1a1a1a','#1a1a1a','#f0e8d0',3),
  ('أزرق','#f0f4ff','#1a1a2e','#1a1a2e','#e0e8ff',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'hero'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- editorial
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('كريمي ذهبي','#faf3e0','#1a1a1a','#b8860b','#f0e8d0',1),
  ('ليلي ذهبي','#1e1a14','#faf3e0','#b8860b','#2a2418',2),
  ('أبيض ذهبي','#ffffff','#1a1a1a','#b8860b','#f8f4e8',3),
  ('كحلي ذهبي','#1a1a2e','#f5f5f5','#b8860b','#252540',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'editorial'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- split
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('بنفسجي','#0e0e12','#f0f0f0','#6c5ce7','#16161e',1),
  ('كحلي','#0f172a','#f0f0f0','#3b82f6','#1e293b',2),
  ('أبيض','#ffffff','#111111','#6366f1','#f0f0f0',3),
  ('أخضر','#0d1b14','#e0e0e0','#10b981','#15291c',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'split'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- stacked
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('وردي','#fdeef5','#5a4a55','#ff7eb6','#fff6fb',1),
  ('خزامي','#f0eef5','#4a4a55','#a78bfa','#f5f3fa',2),
  ('نعناع','#eaf5ee','#4a5a4f','#34d399','#f0faf5',3),
  ('خوخي','#fff0e8','#5a4a3a','#fb923c','#fff5f0',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'stacked'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- cards
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('أخضر','#eafff5','#103a2f','#10a37f','#ffffff',1),
  ('أبيض','#ffffff','#1a1a1a','#6D5EFC','#f5f5f5',2),
  ('ليلي','#0a1a14','#e0e0e0','#10a37f','#15291c',3),
  ('أزرق','#eef5ff','#1a2a3a','#3b82f6','#f0f5ff',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'cards'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- rotated
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('مرجاني','#fff3ee','#3a1c12','#e17055','#ffffff',1),
  ('أصفر','#fffbe6','#3a2a10','#f59e0b','#ffffff',2),
  ('وردي','#fdf2f8','#3a1c2a','#ec4899','#ffffff',3),
  ('تركواز','#eef5f5','#1a2a2a','#14b8a6','#ffffff',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'rotated'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- terminal
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('أخضر نيون','#0d0d0d','#e8e8e8','#3ef58a','#141414',1),
  ('أزرق','#0d0d1a','#e0e0e0','#60a5fa','#14141f',2),
  ('أحمر','#1a0d0d','#e0d0d0','#f87171','#1f1414',3),
  ('أخضر داكن','#0d1a0d','#d0e0d0','#34d399','#142014',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'terminal'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- magazine
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('كرافت','#d9c9a3','#3a2f1d','#8a5a2b','#e7dcc0',1),
  ('أبيض','#f5f0e8','#2a2010','#5a3a18','#e8e0d0',2),
  ('ورق قديم','#e8dcc0','#3a2f1d','#6b5a3a','#f0e8d8',3),
  ('رشمة','#f0e8d8','#3a2a1a','#8a6a3b','#e0d8c8',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'magazine'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- tilt
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('نيلي','#1e1b4b','#f0f0ff','#a78bfa','#60a5fa',1),
  ('تركواز','#0f1b2e','#e0f0f5','#60a5fa','#34d399',2),
  ('بنفسجي','#1a0d2e','#e0d5f5','#c084fc','#a78bfa',3),
  ('وردي','#2e0d1e','#f5e0e8','#f472b6','#fb7185',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'tilt'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);

-- retro
INSERT INTO template_palettes (template_id, name_ar, background_color, text_color, accent_color, secondary_color, sort_order)
SELECT t.id, v.name, v.bg, v.txt, v.acc, v.sec, v.ord
FROM templates t, (VALUES
  ('أصفر','#ffe600','#111111','#ff00a0','#00a0ff',1),
  ('سماوي','#e0f5ff','#111111','#ff00a0','#00a0ff',2),
  ('ليموني','#d4ff00','#111111','#ff00a0','#00a0ff',3),
  ('برتقالي','#ffd000','#111111','#ff00a0','#00a0ff',4)
) AS v(name,bg,txt,acc,sec,ord)
WHERE t.slug = 'retro'
AND NOT EXISTS (SELECT 1 FROM template_palettes tp WHERE tp.template_id = t.id);
