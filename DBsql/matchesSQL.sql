-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.matches', 'U') IS NOT NULL
DROP TABLE dbo.matches
GO
-- Create the table in the specified schema
CREATE TABLE dbo.matches
(
    Match_Id INT IDENTITY(1,1) PRIMARY KEY, -- primary key column
    HomeTeam_Id INT NOT NULL,
    AwayTeam_Id INT NOT NULL,
    MatchDate DATETIME NOT NULL,
    Stadium_name [NVARCHAR](50) NOT NULL,
    HomeTeamGoals INT , 
    AwayTeamGoals INT ,
    RefereeID INT,   --  refDB
    Played BIT NOT NULL, -- 0 not played yet , 1 played !!

    -- specify more columns here
);
GO