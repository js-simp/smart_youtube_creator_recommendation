const express = require('express');
const session = require('express-session')
const dotenv = require('dotenv')
const cors = require('cors');

dotenv.config();

const app = express()
const PORT = process.env.PORT || 5000;
//allocate environment variables

//Middlware
app.use(express.json());
app.use(cors({
    origin : origin,
    credentials : true,
}
));

app.use('/', require('./channels'))

//start listening on port
app.listen(PORT, () => {
    console.log(`Listening on port ... ${PORT}`)
})
