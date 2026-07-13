-- Keep the persisted built-in palette aligned with the accessible app color.

UPDATE template_palettes AS palette
SET background_color = '#256A9B'
FROM templates AS template
WHERE palette.template_id = template.id
  AND template.slug = 'bold-statement'
  AND palette.name_ar = 'أزرق كامل';
