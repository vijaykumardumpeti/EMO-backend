const express = require('express')
const sqlite = require('sqlite')
const {open} = sqlite
const sqlite3 = require('sqlite3')
const cors = require('cors')
const bcrypt = require('bcrypt')
const path = require('path')

const app = express()

app.use(cors())
app.use(express.json())

module.exports = app

const dbPath = path.join(__dirname, 'database.db');

let db = null;
const initializeDBAndServer = async ()=>{
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
    
        app.listen(3000, ()=>{
            console.log('server started at http://localhost:3000')
        })
    } catch (error) {
        console.log(`DB Error: ${error.message}`)
    }
    
}

initializeDBAndServer()

//User Registaration code
app.post('/register', async (req, res)=>{
    try {
        const {username, email, password} = req.body
    //if user doesnt exist then only post
    //{hash the password}
    //if not exist send response as useralready exist message

    let userExistQuery = `select * from user where username = '${username}';`;
    const resultExistence = await db.get(userExistQuery)
    if(resultExistence !== undefined){
        res.status(400)
        res.send({error: 'User already Exists Please Login'})
    }else{
        if(username && email && password){
            //hash the password
            let hashedPassword = await bcrypt.hash(password, 10)
            let postQuery = `insert into 
                                user 
                                (username, email, password)
                            values
                                ('${username}', '${email}', '${hashedPassword}');`;
            let response = await db.run(postQuery);
            res.status(200).json({ message: 'User registered successfully', userId: response.lastID });
        }else{
            res.status(100).json({error: 'username or email or password are undefined'})
        }
                                    
    }
    } catch (e) {
        res.status(500).json({error: `Internal Server Error: ${e.message}`})
    }
});

//User Login 
app.post("/login", async (request, response) => {
        try {
        let { username, password } = request.body;
    
        let userDetailsQuery = `SELECT * FROM  user WHERE username = '${username}';`;
        let user = await db.get(userDetailsQuery);
    
        if (user === undefined) {
            response.status(400).json({error: 'Invalid user'})
        } else {
            let isPasswordMatch = await bcrypt.compare(password, user.password);
            if (isPasswordMatch === true) {
            let payload = { username: username };
            let jwtToken = jwt.sign(payload, "jwt");
            response.send({ jwtToken });
            } else {
            response.status(400).json({error: 'Invalid password'})
            }
        }
        } catch (e) {
        console.log(`DB Error: ${e.message}`);
        }
});

app.get('/', (req, res)=>{
    res.json({message: 'it is the main domain for the EMO.Energy company assignment'})
})



app.get('/register', async (req, res)=>{
    try {
       const getSQLQuery = `select * from user;`;
        const result = await db.all(getSQLQuery)
        res.send(result)
    } catch (e) {
        res.status(500).json({error: `Internal Server Error: ${e.message}`})
    }
});
























