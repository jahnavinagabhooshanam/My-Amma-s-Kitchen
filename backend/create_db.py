import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

host = os.environ.get('MYSQL_HOST', 'localhost')
port = int(os.environ.get('MYSQL_PORT', 3306))
user = os.environ.get('MYSQL_USER', 'root')
password = os.environ.get('MYSQL_PASSWORD', 'your_password')
db_name = os.environ.get('MYSQL_DATABASE', 'hotel_ammas_kitchen')

passwords_to_try = [password, '']

success = False
for pw in passwords_to_try:
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=pw
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.close()
        conn.close()
        print(f"Successfully connected to MySQL and verified database '{db_name}' exists.")
        
        # If we had to fall back to empty password, update the .env file
        if pw != password:
            print("Connected with empty password. Updating .env file...")
            env_path = '.env'
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    content = f.read()
                # Replace password field
                content = content.replace("MYSQL_PASSWORD=your_password", "MYSQL_PASSWORD=")
                content = content.replace(f"MYSQL_PASSWORD={password}", "MYSQL_PASSWORD=")
                with open(env_path, 'w') as f:
                    f.write(content)
        success = True
        break
    except Exception as e:
        print(f"Failed to connect with password '{pw}': {e}")

if not success:
    print("Could not connect to MySQL. Please ensure MySQL is running on localhost:3306.")
    exit(1)
