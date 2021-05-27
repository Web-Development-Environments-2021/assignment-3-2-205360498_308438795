-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.FavoriteMatches', 'U') IS NOT NULL
DROP TABLE dbo.FavoriteMatches
GO
-- Create the table in the specified schema
CREATE TABLE dbo.FavoriteMatches
(
    FavoriteMatche_id INT IDENTITY(1,1) PRIMARY KEY, -- primary key column
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.users(user_id),
    MatchId INT NOT NULL FOREIGN KEY REFERENCES dbo.matches(MatchId),
);
GO


