-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
DROP TABLE dbo.users
GO
-- Create the table in the specified schema
CREATE TABLE dbo.users
(
    user_id INT IDENTITY(1,1) PRIMARY KEY, -- primary key column
    username [NVARCHAR](50) NOT NULL , 
    firstname [NVARCHAR](50) NOT NULL,
    lastname [NVARCHAR](50) NOT NULL,
    country [NVARCHAR](50) NOT NULL,
    password [NVARCHAR](100) NOT NULL,
    email [NVARCHAR](50) NOT NULL,
    image_url [NVARCHAR](50) NOT NULL,
);
GO