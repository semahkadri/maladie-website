-- Allow produit_id to be NULL in lignes_commande (for when products are deleted after stock reaches 0)
-- This is idempotent: running on an already-nullable column is a no-op in PostgreSQL
ALTER TABLE lignes_commande ALTER COLUMN produit_id DROP NOT NULL;
