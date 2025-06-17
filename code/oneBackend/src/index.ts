
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
import { GoogleGenAI } from "@google/genai";
import { AiLesson } from "./models/AiLesson";
import { Lesson } from "./models/Lesson";
import { Subject } from "./models/subject";
import {File} from './models/file'

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

const ai = new GoogleGenAI({apiKey: process.env.GEMINIKEY})

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

         const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `    
          
          Act as a teacher. I want to learn the subject: ${nameSubject}. 
          ${instructionAi? "follow these instructions:"+ instructionAi : ""}
          ${listaFiles.length > 0 ? "here is some documentation files: \n  "+ listaFiles.join("\n\n\n\n") : ""}
          


          Create a lesson plan between ${dateStart} and ${dateEnd}.
          I can spend ${timePerDay} minutes evry day. Not more.
          ${maxLengthLesson? "Make sure max length for a lesson doesn't exceed "+ maxLengthLesson + ' minutes' : ""} 
          If time is limited, make sure you cover all the important topics first, simplified. The lessons must cover as much of the information as possible, end to end.


          Return a list of lesson titles, their duration in minutes, the date of the lesson in ISO format.
          The list of lessons should be in order.
          Return ONLY a json array. Do not attempt to use any other words or phrases other than the json string.

          json format: 

          Lesson = {"title": string, "duration": number, "date": string}

          Return: array<Lesson>

          
          
          
          `,
       });


          const responseBetter = response.text!.replaceAll("```json", "").replaceAll("```", "")

          const arrayLessons: AiLesson[] = JSON.parse(responseBetter)

       console.log(arrayLessons)


       for(let lesson of arrayLessons){
        await baza.execute("INSERT INTO lessons(subjectId, title, durationMinutes, date, content, done) values (?,?,?,?,?,?)", [subjectId, 
          lesson.title, lesson.duration, lesson.date, null, false])
       }

     res.status(201).send({ message: 'Subject added successfully', id: subjectId})
     
  }catch(error){
    console.log("DB Insert Error:", error)
    res.status(500).send({message: "Server error"})
  }
})


app.delete('/api/delete/:id', async (req: AuthenticatedRequest, res: Response): Promise<void>=>{

 
  try{

   const subjectId = +req.params.id

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


app.get('/api/subject/:id', async (req: AuthenticatedRequest, res: Response)=>{

  const id = +req.params.id

  const [subject]= await baza.execute(`SELECT * FROM subjects WHERE id=?`, [id])

  if((subject as any ).length === 0 ){
    res.status(404).send({message: 'Not found'})
  }

  res.status(200).send((subject as any)[0] )


})

app.get('/api/lessons/subjectId/:id', async (req: AuthenticatedRequest, res: Response)=>{

  const Subjectid = +req.params.id

  const [lessons]= await baza.execute(`SELECT * FROM lessons WHERE subjectId=?`, [Subjectid])

  res.status(200).send(lessons)


})

app.get('/api/lesson/:id', async(req: AuthenticatedRequest, res: Response)=>{

try{
  const id = req.params.id

  const [rows]: any = await baza.execute(`SELECT * FROM lessons WHERE id=? `, [id])

  const lesson = rows[0] as Lesson;

  if (lesson.content == null || lesson.summary == null){

    const [subjectRows]: any = await baza.execute(`SELECT * FROM subjects WHERE id=?`, [lesson.subjectId])

    const subject = subjectRows[0] as Subject

    const [fileRows]: any = await baza.execute(`SELECT * FROM files WHERE subjectId=?`, [lesson.subjectId])

    const file = fileRows as File[]


      const resposeAI = ai.models.generateContent({
      model: "gemini-2.0-flash", 
          contents: `
          
           You are teaching a lesson for the subject : ${subject.nameSubject}. The title of the lessson is ${lesson.title}.

                     ${subject.instructionAi ? "follow these instructions if exists:"+ subject.instructionAi : ""}


                     ${file.length > 0 ? "Reference the following documentation files: \n  "+ file.map(x => x.content).join("\n\n\n\n") : ""}



           Develop a well-structured lesson content that can be delivered in no more than ${lesson.durationMinutes} minutes.
           Be clear, engaging, and informative.
           Format the output as HTML, with no html tag, head or body included.
          `
  })


  const resposeAiSummery = ai.models.generateContent({
      model: "gemini-2.0-flash", 
          contents: `You are teaching a lesson for the subject : ${subject.nameSubject}.
                      The title of the lessson is ${lesson.title}.


                       ${subject.instructionAi ? "follow these instructions if exists:"+ subject.instructionAi : ""}


                     ${file.length > 0 ? "Reference the following documentation files: \n  "+ file.map(x => x.content).join("\n\n\n\n") : ""}


                      Generate a clear and concise lesson summary with only the principal ideas that can be understood in exactly one minute. If appropriate, include a high-level lesson skeleton or outline.
                      Be clear, engaging, and informative. Keep your reply short and to the point.
                      Format the output as HTML, with no html tag, head or body included.
                      ` 
  })

  const [summaryResponse, contentResponse] = await Promise.all([resposeAiSummery, resposeAI]);

  const summary = summaryResponse.text?.replaceAll('```html', '').replaceAll('```', '')
  const content = contentResponse.text?.replaceAll('```html', '').replaceAll('```', '')

  await baza.execute(`UPDATE lessons SET content=?, summary=? WHERE id=? `, [content, summary, id])

  lesson.content = content || null
  lesson.summary = summary || null

  }



res.status(201).send(lesson)


}catch(error){

    console.log("DB Read Error:", error)
    res.status(500).send({message: "Server error"})

}
})



app.put('/api/lesson/edit/:id', async (req: AuthenticatedRequest, res: Response)=>{
  try{

    const id = +req.params.id

    const body = req.body as Lesson

    await baza.execute(`UPDATE lessons SET content=?, summary=? WHERE id=?`, [body.content, body.summary, id])

    res.status(200).send({message: 'Success'})

    

    

  }catch(error){
     res.status(500).send({message: 'Server error'})
      console.error('Error updating lesson:', error);

  }
})




const port = process.env.PORT
  app.listen(port, ()=>{
    console.log(`Server is listening on Port ${port}`)
  })