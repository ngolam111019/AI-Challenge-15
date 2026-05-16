-- Create Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    current_version_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tenant Configs table for Versioning
CREATE TABLE IF NOT EXISTS tenant_configs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    config_data JSONB NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, version_number)
);

-- Ensure note column exists for databases created with older schema
ALTER TABLE tenant_configs ADD COLUMN IF NOT EXISTS note VARCHAR(255);

-- Ensure foreign key constraint exists safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_current_version' AND table_name = 'tenants'
    ) THEN
        ALTER TABLE tenants ADD CONSTRAINT fk_current_version FOREIGN KEY (current_version_id) REFERENCES tenant_configs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Sample table for claims
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    claim_type VARCHAR(100),
    amount DECIMAL(15, 2),
    data JSONB,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
