CREATE SCHEMA IF NOT EXISTS controlegastos;

DROP TABLE IF EXISTS controlegastos.parcelas;
DROP TABLE IF EXISTS controlegastos.compras;
DROP TABLE IF EXISTS controlegastos.categorias;
DROP TABLE IF EXISTS controlegastos.meiospagamento;
DROP TABLE IF EXISTS controlegastos.usuarios;

CREATE TABLE controlegastos.usuarios (
  Id bigint unsigned NOT NULL AUTO_INCREMENT,
  Nome varchar(100) NOT NULL,
  Senha char(100) NOT NULL,
  Email varchar(120) NOT NULL,
  PRIMARY KEY (Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE controlegastos.categorias (
  Id bigint unsigned NOT NULL AUTO_INCREMENT,
  Descricao varchar(100) NOT NULL,
  Id_Usuario bigint unsigned NOT NULL,
  PRIMARY KEY (Id),
  KEY Categorias_id_Usuario (Id_Usuario),
  CONSTRAINT Categorias_id_Usuario FOREIGN KEY (Id_Usuario) REFERENCES usuarios (Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE controlegastos.meiospagamento (
  Id bigint unsigned NOT NULL AUTO_INCREMENT,
  Descricao varchar(100) NOT NULL,
  Id_Usuario bigint unsigned NOT NULL,
  PRIMARY KEY (Id),
  KEY MeiosPagamento_id_Usuario (Id_Usuario),
  CONSTRAINT MeiosPagamento_id_Usuario FOREIGN KEY (Id_Usuario) REFERENCES usuarios (Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE controlegastos.compras (
  Id bigint unsigned NOT NULL AUTO_INCREMENT,
  Descricao varchar(100) NOT NULL,
  Data_Compra timestamp NOT NULL,
  Id_Categoria bigint unsigned DEFAULT NULL,
  Id_MeioPagamento bigint unsigned DEFAULT NULL,
  Parcelas int unsigned NOT NULL,
  Valor double NOT NULL,
  Id_Usuario bigint unsigned NOT NULL,
  PRIMARY KEY (Id),
  KEY Compras_id_Usuario (Id_Usuario),
  KEY Compras_id_Categoria (Id_Categoria),
  KEY Compras_id_MeioPagamento (Id_MeioPagamento),
  CONSTRAINT Compras_id_Categoria FOREIGN KEY (Id_Categoria) REFERENCES categorias (Id) ON DELETE RESTRICT,
  CONSTRAINT Compras_id_MeioPagamento FOREIGN KEY (Id_MeioPagamento) REFERENCES meiospagamento (Id) ON DELETE RESTRICT,
  CONSTRAINT Compras_id_Usuario FOREIGN KEY (Id_Usuario) REFERENCES usuarios (Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE controlegastos.parcelas (
  Id bigint unsigned NOT NULL AUTO_INCREMENT,
  Data_Vencimento timestamp NOT NULL,
  Valor double NOT NULL,
  Id_Compra bigint unsigned NOT NULL,
  PRIMARY KEY (Id),
  KEY Parcelas_id_Compra (Id_Compra),
  CONSTRAINT Parcelas_id_Compra FOREIGN KEY (Id_Compra) REFERENCES compras (Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;