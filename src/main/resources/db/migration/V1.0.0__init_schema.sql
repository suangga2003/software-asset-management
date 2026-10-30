-- 1. User Accounts Table
CREATE TABLE IF NOT EXISTS user_accounts (
                                             id BIGSERIAL PRIMARY KEY,
                                             username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    fullname VARCHAR(150)
    );

-- 2. Applications Table
CREATE TABLE IF NOT EXISTS applications (
                                            id BIGSERIAL PRIMARY KEY,
                                            appname VARCHAR(150) NOT NULL,
    owner VARCHAR(150),
    status VARCHAR(50),
    servers VARCHAR(255),
    topologylevel0 VARCHAR(100),
    topologylevel1web VARCHAR(255),
    topologylevel1backend VARCHAR(255),
    topologylevel1database VARCHAR(255),
    interconnections TEXT,
    sourcecodeavailable BOOLEAN DEFAULT true,
    programminglanguage VARCHAR(100),
    osversion VARCHAR(100),
    cicdavailable BOOLEAN DEFAULT true,
    firstreleasedate DATE,
    sunsetdate DATE,
    changehistory TEXT
    );

-- 3. Architecture Blueprint Components Table
CREATE TABLE IF NOT EXISTS architecturecomponent (
                                                     id BIGSERIAL PRIMARY KEY,
                                                     componentname VARCHAR(150) NOT NULL,
    componenttype VARCHAR(100) NOT NULL,
    networkaccess VARCHAR(100),
    description TEXT,
    active BOOLEAN DEFAULT true
    );

-- 4. Default Application Seed Data
INSERT INTO applications (appname, owner, status, servers, topologylevel0, programminglanguage, osversion)
VALUES
    ('Core Ledger System', 'Finance Team', 'ACTIVE', 'srv-core-01', 'CORE_BANKING', 'Java 25 (Quarkus)', 'RHEL 9'),
    ('Customer Portal', 'Digital Team', 'ACTIVE', 'srv-pub-01', 'PUBLIC_APP', 'Node.js 20', 'Ubuntu 22.04');

-- 5. Default Blueprint Components Seed Data
INSERT INTO architecturecomponent (componentname, componenttype, networkaccess, description, active)
VALUES
    ('Core Ledger System', 'CORE_BANKING', 'Restricted', 'Centralized core banking ledger', true),
    ('Customer Portal', 'PUBLIC_APP', 'Internet', 'Customer-facing mobile web portal', true);