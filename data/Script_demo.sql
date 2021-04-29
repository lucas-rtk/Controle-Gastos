/* Cria um usuário default */
INSERT INTO usuarios (Nome, Senha, Email) VALUES ('Usuario', '1', 'conta@exemplo.com');
SELECT @IdUsuario := Id FROM usuarios WHERE Email = 'conta@exemplo.com';

/* Insere categorias para o usuário */
INSERT INTO categorias (Descricao, Id_Usuario) VALUES ('Contas', @IdUsuario);
INSERT INTO categorias (Descricao, Id_Usuario) VALUES ('Gasolina', @IdUsuario);
INSERT INTO categorias (Descricao, Id_Usuario) VALUES ('Apartamento', @IdUsuario);
INSERT INTO categorias (Descricao, Id_Usuario) VALUES ('Compras diversas', @IdUsuario);
INSERT INTO categorias (Descricao, Id_Usuario) VALUES ('Educação', @IdUsuario);
INSERT INTO categorias (Descricao, Id_Usuario) VALUES ('Lazer', @IdUsuario);
INSERT INTO categorias (Descricao, Id_Usuario) VALUES ('Investimentos', @IdUsuario);
INSERT INTO categorias (Descricao, Id_Usuario) VALUES ('Alimentação', @IdUsuario);

/* Insere meios de pagamento para o usuário */
INSERT INTO meiospagamento (Descricao, Id_Usuario) VALUES ('Dinheiro', @IdUsuario);
INSERT INTO meiospagamento (Descricao, Id_Usuario) VALUES ('Débito', @IdUsuario);
INSERT INTO meiospagamento (Descricao, Id_Usuario) VALUES ('Crédito Visa', @IdUsuario);
INSERT INTO meiospagamento (Descricao, Id_Usuario) VALUES ('Crédito Nubank', @IdUsuario);
INSERT INTO meiospagamento (Descricao, Id_Usuario) VALUES ('PIX', @IdUsuario);

/* Insere compras e pagamentos */
SELECT @IdCat := Id from Categorias WHERE Descricao = 'Contas';
SELECT @IdMeio := Id from meiospagamento WHERE Descricao = 'Débito';

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Conta de água', '2021-03-10', @IdCat, @IdMeio, 1, 59.99, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-03-15', 59.99, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Conta de água', '2021-04-10', @IdCat, @IdMeio, 1, 62.31, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-15', 62.31, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Conta de luz', '2021-03-10', @IdCat, @IdMeio, 1, 328.44, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-03-15', 328.44, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Conta de luz', '2021-04-10', @IdCat, @IdMeio, 1, 372.15, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-15', 372.15, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Condomínio', '2021-03-10', @IdCat, @IdMeio, 1, 412.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-03-15', 412.00, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Condomínio', '2021-04-10', @IdCat, @IdMeio, 1, 412.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-15', 412.00, @IdCompra);

SELECT @IdCat := Id from Categorias WHERE Descricao = 'Apartamento';

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Financiamento', '2021-03-08', @IdCat, @IdMeio, 1, 1600.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-03-15', 1600.00, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Financiamento', '2021-04-08', @IdCat, @IdMeio, 1, 1600.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-15', 1600.00, @IdCompra);

SELECT @IdCat := Id from Categorias WHERE Descricao = 'Educação';
INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Faculdade', '2021-03-08', @IdCat, @IdMeio, 1, 860.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-03-15', 860.00, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Faculdade', '2021-04-08', @IdCat, @IdMeio, 1, 860.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-15', 860.00, @IdCompra);

SELECT @IdMeio := Id from meiospagamento WHERE Descricao = 'Crédito Nubank';

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Curso XYZ', '2021-03-08', @IdCat, @IdMeio, 3, 1248.78, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-10', 416.26, @IdCompra);
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-05-10', 416.26, @IdCompra);
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-06-10', 416.26, @IdCompra);

SELECT @IdCat := Id from Categorias WHERE Descricao = 'Gasolina';
SELECT @IdMeio := Id from meiospagamento WHERE Descricao = 'Crédito Visa';

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Posto BR', '2021-03-02', @IdCat, @IdMeio, 2, 300.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-10', 150.00, @IdCompra);
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-05-10', 150.00, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Posto BR', '2021-04-07', @IdCat, @IdMeio, 2, 350.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-10', 175.00, @IdCompra);
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-05-10', 175.00, @IdCompra);

SELECT @IdCat := Id from Categorias WHERE Descricao = 'Investimentos';
SELECT @IdMeio := Id from meiospagamento WHERE Descricao = 'PIX';

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Transferência corretora A', '2021-03-19', @IdCat, @IdMeio, 1, 2500.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-03-19', 2500.00, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Transferência corretora B', '2021-03-19', @IdCat, @IdMeio, 1, 1300.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-03-19', 1300.00, @IdCompra);

INSERT INTO Compras (Descricao, Data_Compra, Id_Categoria, Id_MeioPagamento, Parcelas, Valor, Id_Usuario) VALUES ('Transferência corretora B', '2021-04-23', @IdCat, @IdMeio, 1, 1500.00, @IdUsuario);
SELECT @IdCompra := LAST_INSERT_ID();
INSERT INTO Parcelas (Data_Vencimento, Valor, Id_Compra) VALUES ('2021-04-23', 1500.00, @IdCompra);