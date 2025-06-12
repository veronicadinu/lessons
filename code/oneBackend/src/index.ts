
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise"

import {expressjwt} from "express-jwt";
import jwksRsa from "jwks-rsa";
import { Request, Response, NextFunction } from "express";

import {readFileSync} from "fs";


const app = express();
app.use(express.json({limit: "200mb"}));

// (async () => {
//   console.log("start")
//   const baza2 = await mysql.createConnection({
//       host: process.env.MYSQLHOST,
//       user: process.env.MYSQLUSER ,
//       password: process.env.MYPASSWORD ,
//       waitForConnections: true,
//       connectionLimit: 10,
//       multipleStatements: true,
//       queueLimit: 0 ,
//       timezone: "Z", // PT data in sql ,This 'Z' means UTC in MySQL2
//   });
//   const sqlBaza = readFileSync('./src/baza.sql').toString();
//   baza2.query(sqlBaza)

//   console.log("end")
// })();

const baza = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER ,
    password: process.env.MYPASSWORD ,
    database: process.env.MYSQDATABASE ,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: false,
    queueLimit: 0 ,
    timezone: "Z", // PT data in sql ,This 'Z' means UTC in MySQL2
});

interface AuthenticatedRequest extends Request {
   userAuth?: {
    sub: string; //Auth0 user Id
    [key: string]: any //if you want more ckaims token 
   }
}


app.use(
  expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://dev-kpiuw0wghy7ta8x8.us.auth0.com/.well-known/jwks.json",
    }),
    algorithms: ["RS256"],
    requestProperty: "userAuth", // The decoded JWT will be attached to req.userAuth
  }) as express.RequestHandler // Important to satisfy TypeScript
);






app.get('/api/subjectsAll', async (req: AuthenticatedRequest, res: Response): Promise<void>=>{

  try{
   const userId = req.userAuth?.sub;

   if(!userId) {
    res.status(400).send({message: "User ID not found in token"})
    return
   }
   

   const [subjects] = await baza.execute("SELECT * FROM subjects WHERE userId=? ", [userId])

   res.status(200).send(subjects)

  }catch(error){
    console.log("Error fetching subjects:", error)
    res.status(500).send({message: "Server error"})
  }
})




const port = process.env.PORT
  app.listen(port, ()=>{
    console.log(`Server is listening on Port ${port}`)
  })