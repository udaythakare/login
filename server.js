const express = require('express')
const app = express()
const mysql = require("mysql");
const bodyParser = require('body-parser');
//const session = require('express-session');
app.use(bodyParser.urlencoded({ extended: true }));
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'uday',
    database: 'frontend'
})
// app.use(session({
//     secret: 'lol', // Replace 'your_secret_key' with your own secret key for session encryption
//     resave: false,
//     saveUninitialized: true
// }));


module.exports = connection;
app.use(express.static("./views"));
app.use(express.static("./photos"));
app.use(express.static("./css"));
app.set("view engine", "hbs");
app.use(express.json())

app.get("/", (req, res) => {
    // console.log(req.session.user)
    // if (req.session.user) {
        res.render("index.hbs", { user: req.session.user })
    // }
    // else {
        // res.render("index.hbs")
    // }

})

app.get("/login", (req, res) => {
    res.render("login.hbs")
})
app.get("/register", (req, res) => {
    res.render("registration.hbs")
})

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) === false) {
        res.render("registration.hbs", { msg: "Invalid Email!" })
    }
    else {
        try {
            // Check if the email is already registered in the database
            const isAlreadyUser = await checkEmailExists(email);

            if (isAlreadyUser.length > 0) {
                // Email already exists, handle the error or redirect back to the registration page
                return res.send("Email already registered!");
            }

            // Email does not exist, insert the user into the database
            connection.query(
                "INSERT INTO user (name, email, password) VALUES (?, ?, ?)",
                [username, email, password],
                (error, results) => {
                    if (error) throw error;
                    console.log("New user inserted!");
                    res.redirect("/login");
                }
            );
        } catch (error) {
            console.log(error);
            res.send("An error occurred while processing your request.");
        }
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body
    const user = await checkUserForLogin(username, password)
    console.log(user)
    if (user.length > 0) {
        // req.session.user = user[0];
        res.redirect("/")
    }
    else {
        res.send("wrong username or password")
    }
})

//function if the username with same passworld exists
function checkUserForLogin(username, password) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM user WHERE name=? AND password=?",
            [username, password],
            (error, results) => {
                if (error) reject(error);
                resolve(results);
            }
        );
    });
}

// Function to check if email already exists in the database
function checkEmailExists(email) {
    return new Promise((resolve, reject) => {
        connection.query(
            "SELECT * FROM user WHERE email = ?",
            [email],
            (error, results) => {
                if (error) reject(error);
                resolve(results);
            }
        );
    });
}

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error destroying session:", err);
        } else {
            console.log("User logged out successfully!");
            res.redirect("/");
        }
    });
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("database connected")
})

app.listen(process.env.PORT, () => {
    console.log('listening on port 3006')
})
