INSERT OR IGNORE INTO "User" (id, email, password, nome, createdAt) VALUES
('clr1', 'admin@pedras.com', '$2a$10$YGZeCt.wJ6/YCb0s5bCSleC/v0S6jKVKXRHrQI5Y3zzKpk5BTLWAa', 'Admin', '2024-01-01 00:00:00');

INSERT OR IGNORE INTO "Configuracao" (id, chave, valor) VALUES
('cfg1', 'desconto_avista_pct', '10'),
('cfg2', 'parcelas_cartao', '4'),
('cfg3', 'valor_instalacao_m2', '100'),
('cfg4', 'desconto_corte_cuba_m2', '0.09'),
('cfg5', 'nome_empresa', 'Sua Empresa de Pedras'),
('cfg6', 'telefone_whatsapp', '5585999999999');

INSERT OR IGNORE INTO "Pedra" (id, nome, descricao, precoPorM2, imagemUrl, ativa, createdAt) VALUES
('pedra1', 'Ônix Translúcido Cristallo', 'Bancada elegante com acabamento cristalino', 500, 'https://via.placeholder.com/400x300?text=Onix', 1, '2024-01-01 00:00:00'),
('pedra2', 'Mármore Branco Puro', 'Clássico e sofisticado para qualquer ambiente', 350, 'https://via.placeholder.com/400x300?text=Marmore', 1, '2024-01-01 00:00:00'),
('pedra3', 'Granito Preto São Gabriel', 'Durável e elegante para cozinhas modernas', 250, 'https://via.placeholder.com/400x300?text=Granito', 1, '2024-01-01 00:00:00');
