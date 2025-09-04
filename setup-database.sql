-- Create user and database for CleanFoss application
-- Run this as postgres superuser

-- Create the user
CREATE USER cleanfoss_user WITH PASSWORD 'cleanfoss_password';

-- Create the database
CREATE DATABASE cleanfoss_db OWNER cleanfoss_user;

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE cleanfoss_db TO cleanfoss_user;

-- Connect to the database and grant schema privileges
\c cleanfoss_db;
GRANT ALL ON SCHEMA public TO cleanfoss_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cleanfoss_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cleanfoss_user;

-- Confirm setup
\du cleanfoss_user;
\l cleanfoss_db;
