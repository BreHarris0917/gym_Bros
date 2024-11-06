CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    age INT CHECK (age > 0),
    weight FLOAT CHECK (weight > 0),
    height FLOAT CHECK (height > 0),
    fitness_points INT DEFAULT 0
);


/*
This table connects users to all their fitness information
*/
CREATE TABLE usersToFitness(
    user_id INT,
    fitness_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (fitness_id) REFERENCES fitness(fitness_id),
    PRIMARY KEY (user_id, fitness_id)
);




/*
The fitness table is meant to contain all the fitness records of users. 
*/
CREATE TABLE fitness(
    fitness_id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255),
    workout_time TIME,
    calories_burned INT CHECK(calories_burned >= 0)
);


