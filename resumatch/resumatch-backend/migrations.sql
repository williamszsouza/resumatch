-- ============================================================
--  ResuMatch · Database Migrations
--  Execute no MySQL Workbench na ordem abaixo.
--  Compatível com MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS resumatch
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE resumatch;

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  uuid           CHAR(36)      NOT NULL DEFAULT (UUID()),
  name           VARCHAR(120)  NOT NULL,
  email          VARCHAR(255)  NOT NULL,
  password_hash  VARCHAR(255)      NULL,          -- NULL para usuários OAuth
  google_id      VARCHAR(255)      NULL,
  avatar_url     VARCHAR(500)      NULL,
  onboarded      TINYINT(1)    NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME          NULL,          -- soft delete (LGPD)

  PRIMARY KEY (uuid),
  UNIQUE KEY uq_users_email    (email),
  UNIQUE KEY uq_users_google   (google_id),
  INDEX  idx_users_deleted     (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── refresh_tokens ────────────────────────────────────────────────────────────
-- Armazena apenas o hash do token — o token raw fica somente no cookie do cliente.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_uuid   CHAR(36)        NOT NULL,
  token_hash  CHAR(64)        NOT NULL,           -- SHA-256 hex do token raw
  expires_at  DATETIME        NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at  DATETIME            NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_token_hash  (token_hash),
  INDEX  idx_rt_user        (user_uuid),
  INDEX  idx_rt_expires     (expires_at),
  CONSTRAINT fk_rt_user
    FOREIGN KEY (user_uuid) REFERENCES users (uuid)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── plans ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name        VARCHAR(60)     NOT NULL,
  price       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  description VARCHAR(255)        NULL,
  features    JSON                NULL,           -- array de strings
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_plans_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── subscriptions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_uuid          CHAR(36)        NOT NULL,
  plan_id            INT UNSIGNED    NOT NULL,
  status             ENUM('active','canceled','expired','trialing') NOT NULL DEFAULT 'active',
  gateway_reference  VARCHAR(255)        NULL,
  current_period_end DATETIME            NULL,
  created_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_sub_user   (user_uuid),
  INDEX idx_sub_status (status),
  CONSTRAINT fk_sub_user
    FOREIGN KEY (user_uuid) REFERENCES users (uuid) ON DELETE CASCADE,
  CONSTRAINT fk_sub_plan
    FOREIGN KEY (plan_id)   REFERENCES plans  (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── transactions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_uuid    CHAR(36)        NOT NULL,
  amount       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  status       ENUM('paid','pending','failed','refunded') NOT NULL DEFAULT 'pending',
  gateway_name VARCHAR(60)         NULL,
  metadata     JSON                NULL,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_tx_user   (user_uuid),
  INDEX idx_tx_status (status),
  CONSTRAINT fk_tx_user
    FOREIGN KEY (user_uuid) REFERENCES users (uuid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed: planos iniciais ─────────────────────────────────────────────────────
INSERT IGNORE INTO plans (id, name, price, description, features) VALUES
(1, 'Free',     0.00,   'Ideal para experimentar',
  '["5 análises/mês","Relatório básico","Suporte por e-mail"]'),
(2, 'Pro',      49.90,  'Para profissionais em busca ativa',
  '["Análises ilimitadas","Relatório detalhado","Palavras-chave ATS","Suporte prioritário"]'),
(3, 'Business', 129.90, 'Para times de RH e recrutamento',
  '["Tudo do Pro","Multi-usuários até 10","API de integração","Gerente de conta dedicado"]');
