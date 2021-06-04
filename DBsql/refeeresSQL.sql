-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.Referees', 'U') IS NOT NULL
DROP TABLE dbo.Referees
GO
-- Create the table in the specified schema
CREATE TABLE dbo.Referees
(
    referee_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY, -- primary key column
    first_name [NVARCHAR](50) NOT NULL,
    last_name [NVARCHAR](50) NOT NULL
    -- specify more columns here
);
GO