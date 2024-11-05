CREATE TABLE users(
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50),
    password VARCHAR(50) NOT NULL,
    firstName vARCHAR(50),
    lastName VARCHAR(50),
    age INT(5),
    weight FLOAT(5),
    height FLOAT(15),
    fitness_points INT(5)
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
    description CHAR(255),
    workout_time TIME,
    calories_burned INT(50),
);


