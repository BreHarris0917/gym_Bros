#!/bin/bash
# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private
# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://fitness_user:y8uSJbt5I7pJbEQIcGg7N6dZyCxGzjAh@dpg-csvpfljtq21c73froalg-a.oregon-postgres.render.com/fitness_db_jqxr"
# Execute each .sql file in the directory
for file in init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done