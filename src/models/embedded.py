import psycopg2 as pg
from psycopg2 import Error
from os import getenv
from dotenv import load_dotenv

# loading variables from .env file
load_dotenv() 

connection = None
cursor = None

try:
    connection = pg.connect(getenv("DB_URL"))
    # Enable autocommit mode to ensure that DDL commands are immediately committed
    connection.autocommit = True
    cursor = connection.cursor()

    print("Server Information: ")
    print(connection.get_dsn_parameters(), "\n")

    cursor.execute('SELECT version();')
    record = cursor.fetchone()

    print("Connected to: ", record, "\n")

    with open("completeDatabase.sql", "r") as file:
        sql = file.read()
        # Execute SQL file content
        cursor.execute(sql)
        print("Database created successfully")

except (Exception, Error) as e:
    print("Error while connecting to database or executing SQL...", e)

finally:
    if cursor:
        cursor.close()

    if connection:
        connection.close()
        print("PostgreSQL connection is closed")