-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.Permissions', 'U') IS NOT NULL
DROP TABLE dbo.Permissions
GO
-- Create the table in the specified schema
CREATE TABLE dbo.Permissions
(
    Permission_Id INT IDENTITY(1,1) PRIMARY KEY, -- primary key column
    user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.users(user_id),
    permission_char [NVARCHAR](1) NOT NULL -- A - associationMember, M - manager,O - owner, P - player, R - refeere , C - coach
    -- specify more columns here
);
GO
