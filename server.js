//npm install express mongoose ejs dotenv

// Declare Variables

// Requires that Express be imported into Node
const express = require('express') 

// Creates an Express Application
const app = express()

// Require that MogoClient be imported
const MongoClient = require('mongodb').MongoClient

// Establishes a local port on port 2121
const PORT = 2121

// Allows you to hide variables?
require('dotenv').config()

// Create Database and sets dbConnectionStr to address provided in MongoDB
let db, //declare a variable db, but don't assign a value
    dbConnectionStr = process.env.DB_STRING, //declaring a variable and assigning our database connection string to it
    dbName = 'LeonToDo'//declaring a variable and assigning the name of the database we will be using

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) //Creating a connection to MongoDB and passing in our connecting string. Also, passing in an additional property - useUnifiedTopology
    .then(client => { //Waiting for the connection and proceding if successful.
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName) // assigning a value to previously declared db variable that contains a db client factory method.
    })
    


// Set Middleware (MW helps to facilitate our communications)
app.set('view engine', 'ejs') //sets ejs as default render
app.use(express.static('public')) //sets the location for static assets - in this case the 'public' folder
app.use(express.urlencoded({ extended: true })) //Tells express to decode and encode URLs where the header matches the content. Supports arrays and objects.
app.use(express.json()) //Parses JSON content from incoming requests


// Get Method
app.get('/',async (request, response)=>{ //starts a GET method when the route is passed in. Sets up req and res parameters
    const todoItems = await db.collection('todos').find().toArray() //sets variable and awaits all items from the todos collection
    const itemsLeft = await db.collection('todos').countDocuments({completed: false}) //sets variable and awaits a count of uncomplted items to later display EJS
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) // rendering the EJS file and passing through the db items and the count remaining inside of an object.
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

// Post Method
app.post('/addTodo', (request, response) => { //starts a POST method when the add route is passed in
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) //inserts a new item into todos collection
    .then(result => { //if insert is successful, do something
        console.log('Todo Added') 
        response.redirect('/') //gets rid of the /addTodo rooute, and redirects back to homepage
    })
    .catch(error => console.error(error))
}) 

app.put('/markComplete', (request, response) => { //starting a PUT method when the markComplete route is passed in.
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ // look in the db for one item matching the name of the item passed in from the main.js file that was clicked on
        $set: {
            completed: true //set commpleted status to true
          }
    },{
        sort: {_id: -1}, //sorts item to the bottom of the list
        upsert: false //prevents insertion if item does not alreay exist
    })
    .then(result => { //starts a then if update was succesful
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {//starts a PUT method when the markUncomplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //look in the db for one item matching th main.js file that was clicked on
        $set: {
            completed: false //set completed status to false
          }
    },{
        sort: {_id: -1}, //moves item to the bottom of the list
        upsert: false //prevents insertion if item does not already exist
    })
    .then(result => { 
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

// Delete
app.delete('/deleteItem', (request, response) => { //starts a DELETE method when the delete route is passed in
    db.collection('todos').deleteOne({thing: request.body.itemFromJS}) //look inside the todos collection for the ONE item matching name from our JS file
    .then(result => { //starts a then if delete succesful
        console.log('Todo Deleted')
        response.json('Todo Deleted')//send response back to sender
    })
    .catch(error => console.error(error))

})

// Start Server
app.listen(process.env.PORT || PORT, ()=>{ //setting up which port we will be listening on. Either the port from the .env file or the variable PORT value
    console.log(`Server running on port ${PORT}`)
})