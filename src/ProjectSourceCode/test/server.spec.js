// // ********************** Initialize server **********************************
// const {server, db} = require('../index'); //TODO: Make sure the path to your index.js is correctly added


// // ********************** Import Libraries ***********************************

// const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
// const chaiHttp = require('chai-http');
// chai.should();
// chai.use(chaiHttp);
// const { assert, expect } = chai;

// // ********************** DEFAULT WELCOME TESTCASE ****************************

// describe('Server!', () => {
//   // Sample test case given to test / endpoint.
//   it('Returns the default welcome message', done => {
//     chai
//       .request(server)
//       .get('/welcome')
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.body.status).to.equals('success');
//         assert.strictEqual(res.body.message, 'Welcome!');
//         done();
//       });
//   });
// });
// // *********************** UNIT TEST CASE 1: Test / server status **************************

// it('Returns server status', done => {
//   chai
//     .request(server)
//     .get('/status')
//     .end((err, res) => {
//       expect(res).to.have.status(200);
//       expect(res.body.status).to.equals('success');
//       assert.strictEqual(res.body.message, 'Server is up and running');
//       done();
//     });
// });

// // *********************** UNIT TEST CASE 2: Test /data endpoint with POST request **************************

// it('Posts data successfully', done => {
//   const requestData = { name: 'John Doe', age: 30 };
//   chai
//     .request(server)
//     .post('/data')
//     .send(requestData)
//     .end((err, res) => {
//       expect(res).to.have.status(201);
//       expect(res.body.status).to.equals('success');
//       assert.strictEqual(res.body.message, 'Data received');
//       assert.deepEqual(res.body.data, requestData); // Check if the data received matches
//       done();
//     });
// });


// // *********************** UNIT TEST CASE 1: Test /API (Positive) **************************

// // Example Positive Testcase :
// // API: /add_user
// // Input: {id: 5, name: 'John Doe', dob: '2020-02-20'}
// // Expect: res.status == 200 and res.body.message == 'Success'
// // Result: This test case should pass and return a status 200 along with a "Success" message.
// // Explanation: The testcase will call the /add_user API with the following input
// // and expects the API to return a status of 200 along with the "Success" message.


// describe('Testing Add User API', () => {
//   it('positive : /register', done => {
//     chai
//       .request(server)
//       .post('/register')
//       //.send({id: 5, name: 'John Doe', dob: '2020-02-20'})
//       .send({
//         username: 'test_user',       // Required field
//         password: 'securepass', // Required field
//         firstName: 'John',
//         lastName: 'Doe'
//       })
//       .end((err, res) => {
//         if (err) return done(err);
//         expect(res).to.have.status(200);
//         expect(res.body.message).to.equals('Success');
//         done();
//       });
//   });
// });


// //We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 400 along with a "Invalid input" message.

// //**************Testing add user API (negative test case) **************************
// describe('Testing Add User API', () => {
//   // it('positive : /add_user', done => {
//   //   // Refer above for the positive testcase implementation
//   // });

//   // Example Negative Testcase :
//   // API: /add_user
//   // Input: {id: 5, name: 10, dob: '2020-02-20'}
//   // Expect: res.status == 400 and res.body.message == 'Invalid input'
//   // Result: This test case should pass and return a status 400 along with a "Invalid input" message.
//   // Explanation: The testcase will call the /add_user API with the following invalid inputs
//   // and expects the API to return a status of 400 along with the "Invalid input" message.
//   // Negative Test Case:
//   // Test that the API returns a 400 status code and "Invalid input" message when data is incorrect
//   it('Negative: /register with invalid username type', (done) => {
//     chai
//       .request(server)
//       .post('/register')
//       .send({
//         username: 12345,        // Invalid type for username (should be a string)
//         password: 'securepass', // Valid password
//         firstName: 'John',
//         lastName: 'Doe'
//       })
//       .end((err, res) => {
//         expect(res).to.have.status(400); // Expecting a 400 Bad Request
//         expect(res.body.message).to.equals('Invalid input');
//         done();
//       });
//   });
// });


// //**************Testing redirecting to another API **************************
// // describe('Testing Redirect', () => {
// //   // Sample test case given to test /test endpoint.
// //   it('\test route should redirect to /login with 302 HTTP status code', done => {
// //     chai
// //       .request(server)
// //       .get('/test')
// //       .end((err, res) => {
// //         res.should.have.status(302); // Expecting a redirect status code
// //         res.should.have.header('location').match(/\/login$/); // Check if the Location header ends with /login
// //         done();
// //       });
// //   });
// // });


// //**************Testing rendering**************************
// describe('Testing Render', () => {
//   // Sample test case given to test /test endpoint.
//   it('test "/login" route should render with an html response', done => {
//     chai
//       .request(server)
//       .get('/login') // for reference, see lab 8's login route (/login) which renders home.hbs
//       .end((err, res) => {
//         res.should.have.status(200); // Expecting a success status code
//         res.should.be.html; // Expecting a HTML response
//         done();
//       });
//   });
// });


// // //***************** Part C: Two additional test cases ******************** */
// // Authentication middleware
//  //const db = require('../src/db'); // Make sure to use the correct path to your db module
// //const app = require('../index'); // Path to your main server file
// //chai.use(chaiHttps);
// //const { expect } = chai;
// const bcrypt = require('bcryptjs');
// //const chaiHttp = require('chai-http');
// //const { app, db } = require('../index');


// describe('Profile Route Tests', () => {
//   let agent; // This will hold the session agent for authenticated requests
//   const testUser = {
//     username: 'testuser',
//     password: 'testpass123',
//   };

//   // Runs once before all tests: Set up the database and test user
//   before(async () => {
//     // Clear users table and create test user with hashed password
//     await db.query('TRUNCATE TABLE users CASCADE');
//     const hashedPassword = await bcrypt.hash(testUser.password, 10);
//     await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
//       testUser.username,
//       hashedPassword,
//     ]);
//   });

//   // Create a new agent for each test to manage session cookies
//   beforeEach(() => {
//     agent = chai.request.agent(server);
//   });

//   // Close the agent after each test to clear session data
//   afterEach(() => {
//     agent.close();
//   });

//   // Clean up after all tests
//   after(async () => {
//     await db.query('TRUNCATE TABLE users CASCADE');
//     db.$pool.end(); //closing data base after test connection NEW
//   });

//   // Negative Test: Unauthenticated Access
//   describe('GET /fitness', () => {
//     it('should return 401 if user is not authenticated', done => {
//       chai
//         .request(server)
//         .get('/fitness')
//         .end((err, res) => {
//           expect(res).to.have.status(401);
//           done();
//         });
//     });

//     // Positive Test: Authenticated Access
//     it('should return user profile when authenticated', async () => {
//       // First, log in to establish a session
//       await agent.post('/login').send(testUser);

//       // Then access profile endpoint
//       const res = await agent.get('/fitness');

//       // Verify the response for authenticated access
//       expect(res).to.have.status(200);
//     });
//   });
// });