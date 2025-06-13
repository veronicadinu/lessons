
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise"

import {expressjwt} from "express-jwt";
import jwksRsa from "jwks-rsa";
import { Request, Response } from "express";

import { AddSubjectRequest } from "./models/addSubjectRequest";
import {pdfToText} from 'pdf-ts';
import { Readable } from 'stream';

//base64 to stream 
function frombase64tostream( base64: string){
  const buffer = Buffer.from(base64, 'base64');
  const stream = Readable.from(buffer);
  return stream
  
}

// pdf-parse expects a Buffer, so we collect stream first
// stream to text 
const getTextFromStream = async (stream: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  const buffer = Buffer.concat(chunks);
  const data = await pdfToText(buffer);
  return data;
};


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


app.post('/api/addSubject', async (req: AuthenticatedRequest, res: Response): Promise<void>=>{

  try{

    const userId = req.userAuth?.sub
    const {nameSubject,instructionAi, dateEnd,dateStart,files,maxLengthLesson,timePerDay} = req.body as AddSubjectRequest

    if(!userId) {
    res.status(400).send({message: "User ID not found in token"})
    return
   }

   if(!nameSubject  || !dateEnd || !dateStart || !timePerDay ) {
     res.status(400).send({message: 'Missing required fields'})
     return
   }


  const rezultatsubjectId =  await baza.execute("INSERT INTO subjects (nameSubject, instructionAi, startDate, endDate , timePerDay,  maxLengthLesson, userId) VALUES (?,?,?,?,?,?,?)",
     [nameSubject, instructionAi || null, dateStart, dateEnd, timePerDay,  maxLengthLesson || null, userId])

       const subjectId =  (rezultatsubjectId[0] as any).insertId

       const listaFiles: string[] = []

       if(files && files.length > 0 ){

        for (let f of files){
          
          const stream = frombase64tostream(f)

          const text = await getTextFromStream(stream)
          
          listaFiles.push(text)
             
          await baza.execute("INSERT INTO files(subjectId, content) VALUES (?,?)", [subjectId, text])
        }
       }

       //Gemini

       

     res.status(201).send({ message: 'Subject added successfully'})
     
  }catch(error){
    console.log("DB Insert Error:", error)
    res.status(500).send({message: "Server error"})
  }
})


app.delete('/api/delete/:id', async (req: AuthenticatedRequest, res: Response): Promise<void>=>{

 
  try{

   const subjectId = req.params.id

   console.log(subjectId)

   if(!subjectId){
       res.status(400).send({ message: 'Subject ID is required' });
       return; }

    await baza.execute('DELETE FROM subjects WHERE id=?', [subjectId])
    res.status(200).send({message: 'Subject deleted successfully'})

  }catch(error){
    res.status(500).send({message: 'Server error'})
      console.error('Error deleting subject:', error);
  }
  
})




const port = process.env.PORT
  app.listen(port, ()=>{
    console.log(`Server is listening on Port ${port}`)
  })