/*
code is commented out because changes are to be made.

The users table is meant to contain all information when a user registers their account

CREATE TABLE users(
    user_id PRIMARY KEY,
    username VARCHAR(50),
    password CHAR(50),
    firstName CHAR(50),
    lastName CHAR(50),
    age INT(5),
    weight INT(5),
    height VARCHAR(15),
);
*/



/*
This table connects users to all their fitness information
CREATE TABLE usersToFitness(
    user_id,
    fitness_id
);
*/



/*
The fitness table is meant to contain all the fitness records of users. 

CREATE TABLE fitness(
    fitness_id PRIMARY KEY
    workout_time VARCHAR(50),
    calories_burned VARCHAR(50),
);
*/



/*
This table connects all fitness to the 
CREATE TABLE fitnessToWorkoutType(
    fitness_id,
    workout_id
);
*/



/*
This table contains the different types of workouts a user can have, ex: cardio...
CREATE TABLE workoutTypes(
    workout_id PRIMARY KEY
);
*/