-- Adicionar seção Voz do Povo no menu de ordenação do admin
INSERT INTO home_sections_order (section_name, display_name, ordem, ativo)
VALUES ('voz_do_povo', 'Voz do Povo', 14, true)
ON CONFLICT (section_name) DO NOTHING;