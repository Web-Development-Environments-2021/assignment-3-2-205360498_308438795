-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.FavoriteTeams', 'U') IS NOT NULL
DROP TABLE dbo.FavoriteTeams
GO
-- Create the table in the specified schema
CREATE TABLE dbo.FavoriteTeams
(
    FavoriteTeam_id INT IDENTITY(1,1) PRIMARY KEY, -- primary key column
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.users(user_id), 
    team_id INT NOT NULL 
    -- specify more columns here
);
GO