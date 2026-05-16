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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, version_number)
);

-- Update tenants with the reference to current version
-- (Will be updated after inserting into tenant_configs)
ALTER TABLE tenants ADD CONSTRAINT fk_current_version FOREIGN KEY (current_version_id) REFERENCES tenant_configs(id);

-- Sample table for claims
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    claim_type VARCHAR(100),
    amount DECIMAL(15, 2),
    data JSONB,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
