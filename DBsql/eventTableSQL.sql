-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL
DROP TABLE dbo.Events
GO
-- Create the table in the specified schema
CREATE TABLE dbo.Events
(
    Event_Id INT IDENTITY(1,1) PRIMARY KEY, -- primary key column
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    minute INT NOT NULL,
    game_event [NVARCHAR](50) NOT NULL, --- goal , offside , foul ,red card , yellow card , injury , substitute
    MatchId INT NOT NULL FOREIGN KEY REFERENCES dbo.matches(Match_Id),
    -- specify more columns here
);
GO
