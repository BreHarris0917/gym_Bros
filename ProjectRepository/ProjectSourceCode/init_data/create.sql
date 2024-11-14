CREATE TABLE IF NOT EXISTS users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT CHECK (age > 0),
    weight FLOAT CHECK (weight > 0),
    height_feet CHECK (height_feet > 0),
    height_inch CHECK (height_inch > 0),
    fitness_points INT DEFAULT 0,
    firstname VARCHAR(100), 
    lastname VARCHAR(100), 
);

/*
The fitness table is meant to contain all the fitness records of users. 
*/
CREATE TABLE IF NOT EXISTS fitness(
    fitness_id SERIAL PRIMARY KEY ,
    description VARCHAR(255),
    workout_time TIME,
    calories_burned INT CHECK(calories_burned >= 0)
);
/*
This table connects users to all their fitness information
*/
CREATE TABLE IF NOT EXISTS usersToFitness(
    user_id INT,
    fitness_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (fitness_id) REFERENCES fitness(fitness_id),
    PRIMARY KEY (user_id, fitness_id)
);







