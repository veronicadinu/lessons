import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";

import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { Request, Response } from "express";

import { AddSubjectRequest } from "./models/addSubjectRequest";
import { pdfToText } from "pdf-ts";
import { Readable } from "stream";
import { GoogleGenAI } from "@google/genai";
import { AiLesson } from "./models/AiLesson";
import { Lesson } from "./models/Lesson";
import { Subject } from "./models/subject";
import { File } from "./models/file";
import { Question } from "./models/question";
import { extractImagesFromPdf } from "pdf-extract-image";
import { Photo } from "./models/photo";
import { Push } from "./models/push";
import WebPush from "web-push";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import cron from "node-cron";
import { CreditResponse } from "./models/credit-response";
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPEPRIVATEKEY as string)


const CREDITS_PER_SUBJECT = 100;




dayjs.extend(utc);
dayjs.extend(timezone);

//base64 to stream
function frombase64tostream(base64: string) {
  const buffer = Buffer.from(base64, "base64");
  const stream = Readable.from(buffer);
  return stream;
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

function base64ToUint8Array(base64: string) {
  // Decode the Base64 string
  const binaryString = atob(base64);

  // Create a new Uint8Array
  const uint8Array = new Uint8Array(binaryString.length);

  // Populate it with the character codes
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
}

const app = express();
app.use(express.json({ limit: "200mb" }));

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
  user: process.env.MYSQLUSER,
  password: process.env.MYPASSWORD,
  database: process.env.MYSQDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: false,
  queueLimit: 0,
  timezone: "Z", // PT data in sql ,This 'Z' means UTC in MySQL2
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINIKEY });

interface AuthenticatedRequest extends Request {
  userAuth?: {
    sub: string; //Auth0 user Id
    [key: string]: any; //if you want more ckaims token
  };
}

WebPush.setVapidDetails(
  process.env.VAPIDEMAIL!,
  process.env.VAPIDPUBLICKEY!,
  process.env.VAPIDPRIVATEKEY!
);

app.use(
  expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri:
        "https://dev-kpiuw0wghy7ta8x8.us.auth0.com/.well-known/jwks.json",
    }),
    algorithms: ["RS256"],
    requestProperty: "userAuth", // The decoded JWT will be attached to req.userAuth
  }) as express.RequestHandler // Important to satisfy TypeScript
);



// app.post('/api/create/session', async (req: AuthenticatedRequest, res: Response)=>{
//   const {credits} = req.body

//   try{

//     const session = await stripe.checkout.sessions.create({

//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: `${credits} AI Credits`,
//             },
//             unit_amount: credits * 100, // in cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       success_url: 'http://localhost:4200/success',
//       cancel_url: 'http://localhost:4200/cancel',

//     })

//      res.json({ id: session.id });

//   }catch(error){
//      console.log("Error fetching credits:", error);
//       res.status(500).send({ message: "Server error" });
//   }
// })


app.get("/api/credits/free", async (req: AuthenticatedRequest, res: Response)=>{
  try {
      const userId = req.userAuth?.sub;

      if (!userId) {
        res.status(400).send({ message: "User ID not found in token" });
        return;
      }


      const [userCredit]: any = await baza.execute("SELECT * FROM credits WHERE userId=?", [userId])

      if(userCredit.length > 0){

        res.status(200).send({message: 'Already exist your credit'})
        return
      
        
      }

      await baza.execute("INSERT INTO credits (userId, credits) VALUES (?,?)", [userId, 50])
      res.status(200).send({message: 'OK'})


     

    } catch (error) {
      console.log("Error fetching subjects:", error);
      res.status(500).send({ message: "Server error" });
    }
  
  
})


app.get("/api/credits/amount", async (req: AuthenticatedRequest, res: Response)=>{
  try {
      const userId = req.userAuth?.sub;

      if (!userId) {
        res.status(400).send({ message: "User ID not found in token" });
        return;
      }


      const [userCredit]: any = await baza.execute("SELECT * FROM credits WHERE userId=?", [userId])

      if(userCredit.length === 0){

        res.status(200).send({credit: 0} as CreditResponse)
        return
      
        
      }
      
      res.status(200).send({credit: userCredit[0].credits} as CreditResponse)


     

    } catch (error) {
      console.log("Error fetching subjects:", error);
      res.status(500).send({ message: "Server error" });
    }
  
  
})


app.put('/api/credits/updates', async (req: AuthenticatedRequest, res: Response)=>{

  try{

    const userId = req.userAuth?.sub;

    const body = req.body 

    if (!userId) {
        res.status(400).send({ message: "User ID not found in token" });
        return;
      }

    const [userCredits]: any = await baza.execute("SELECT * FROM credits WHERE userId=? ", [userId])

     if (!userCredits || userCredits.length === 0) {
      res.status(404).send({ message: "User credits not found" });
      return;
    }

      const currentCredits = userCredits[0].credits
      const additionalCredits = Number(body.credits)

       if (isNaN(additionalCredits)) {
      res.status(400).send({ message: "Invalid credits value" });
      return;
    }

    const updateCredits = currentCredits + additionalCredits

       // Update database
      await baza.execute("UPDATE credits SET credits=? WHERE userId=?", [updateCredits, userId])

      // Return the new total
      res.status(200).send({credit: updateCredits})

  }catch(error){
    
      console.log("Error update credits:", error);
      res.status(500).send({ message: "Server error" });
  }
  
})




app.get(
  "/api/subjectsAll",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userAuth?.sub;

      if (!userId) {
        res.status(400).send({ message: "User ID not found in token" });
        return;
      }

      const [subjects] = await baza.execute(
        "SELECT * FROM subjects WHERE userId=? ",
        [userId]
      );

      res.status(200).send(subjects);
    } catch (error) {
      console.log("Error fetching subjects:", error);
      res.status(500).send({ message: "Server error" });
    }
  }
);

app.post(
  "/api/addSubject",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userAuth?.sub;
      const {
        nameSubject,
        language,
        instructionAi,
        dateEnd,
        dateStart,
        files,
        maxLengthLesson,
        timePerDay,
        activatedPush,
        notificationTime,
        timeZone,
      } = req.body as AddSubjectRequest;

      if (!userId) {
        res.status(400).send({ message: "User ID not found in token" });
        return;
      }

      if (!nameSubject || !dateEnd || !dateStart || !timePerDay || !language) {
        res.status(400).send({ message: "Missing required fields" });
        return;
      }



    // Check if user has enough credits
      const [userCredits]: any = await baza.execute("SELECT * FROM credits WHERE userId=?", [userId]);
      const currentCredits = userCredits.length > 0 ? userCredits[0].credits : 0; 

      if (currentCredits < CREDITS_PER_SUBJECT) {
        res.status(400).send({ message: "Not enough credits to add a subject" });
        return;
      }



      const listaFiles: string[] = [];

      const listaPhoto: string[] = []; ///base64 lista photo

      let nrCuvinte = 0;

      if (files && files.length > 0) {
        for (let f of files) {
          const stream = frombase64tostream(f);

          const buffer = base64ToUint8Array(f);

          const images = await extractImagesFromPdf(buffer as any);

          const imagesbase64 = images.map((i) => {
            return i.toString("base64");
          });

          const text = await getTextFromStream(stream);
          nrCuvinte = nrCuvinte + text.split(" ").length;

          listaFiles.push(text);
          listaPhoto.push(...imagesbase64);
        }
      }

      nrCuvinte = nrCuvinte + (instructionAi ? instructionAi.split(" ").length : 0);
      let nrPoze = listaPhoto.length;

      // Validation
      if (nrCuvinte > 10000) {
        res.status(400).send({
          message: "The total number of words in the files exceeds 10,000",
        });
        return;
      }

      if (nrPoze > 10) {
        res.status(400).send({
          message: "The total number of photos exceeds 10",
        });
        return;
      }



      const rezultatsubjectId = await baza.execute(
        "INSERT INTO subjects (nameSubject, language, instructionAi, startDate, endDate , timePerDay,  maxLengthLesson, userId, activatedPush, notificationTime, timeZone) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        [
          nameSubject,
          language,
          instructionAi || null,
          dateStart,
          dateEnd,
          timePerDay,
          maxLengthLesson || null,
          userId,
          activatedPush,
          notificationTime,
          timeZone,
        ]
      );

      const subjectId = (rezultatsubjectId[0] as any).insertId;


        for (let f of listaFiles) {
          
          await baza.execute(
            "INSERT INTO files(subjectId, content) VALUES (?,?)",
            [subjectId, f]
          );
        }

          for (let p of listaPhoto) {
            await baza.execute(
              "INSERT INTO photos(subjectId, content, type) VALUES (?,?,?)",
              [subjectId, p, ".jpg"]
            );
          }

      //Gemini

      const contents: any = [
        {
          text: `    
          
          Act as a teacher. I want to learn the subject: ${nameSubject}. 
          Use the language: ${language}.
          ${instructionAi ? "follow these instructions:" + instructionAi : ""}
          ${
            listaFiles.length > 0
              ? "here is some documentation files: \n  " +
                listaFiles.join("\n\n\n\n")
              : ""
          }
           ${
             listaPhoto.length > 0
               ? "take into account the attached photos"
               : ""
           }

          


          Create a lesson plan between ${dateStart} and ${dateEnd}.
          I can spend ${timePerDay} minutes evry day. Not more.
          ${
            maxLengthLesson
              ? "Make sure max length for a lesson doesn't exceed " +
                maxLengthLesson +
                " minutes"
              : ""
          } 
          If time is limited, make sure you cover all the important topics first, simplified. The lessons must cover as much of the information as possible, end to end.


          Return a list of lesson titles, their duration in minutes, the date of the lesson in ISO format.
          The list of lessons should be in order.
          Return ONLY a json array. Do not attempt to use any other words or phrases other than the json string.

          json format: 

          Lesson = {"title": string, "duration": number, "date": string}

          Return: array<Lesson>

          
          
          
          `,
        },
      ];

      for (let p of listaPhoto) {
        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: p,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          maxOutputTokens: 3000
        }
      });

      const responseBetter = response
        .text!.replaceAll("```json", "")
        .replaceAll("```", "");

      const arrayLessons: AiLesson[] = JSON.parse(responseBetter);

      console.log(arrayLessons);

      for (let lesson of arrayLessons) {
        await baza.execute(
          "INSERT INTO lessons(subjectId, title, durationMinutes, date, content, done) values (?,?,?,?,?,?)",
          [subjectId, lesson.title, lesson.duration, lesson.date, null, false]
        );
      }

      // Deduct credits
      await baza.execute(
        "UPDATE credits SET credits = ? WHERE userId = ?", [currentCredits - CREDITS_PER_SUBJECT, userId]);

      res
        .status(201)
        .send({ message: "Subject added successfully", id: subjectId });
    } catch (error) {
      console.log("DB Insert Error:", error);
      res.status(500).send({ message: "Server error" });
    }
  }
);

app.delete(
  "/api/delete/:id",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const subjectId = +req.params.id;

      console.log(subjectId);

      if (!subjectId) {
        res.status(400).send({ message: "Subject ID is required" });
        return;
      }

      await baza.execute("DELETE FROM subjects WHERE id=?", [subjectId]);
      res.status(200).send({ message: "Subject deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
      console.error("Error deleting subject:", error);
    }
  }
);

app.get(
  "/api/subject/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    const id = +req.params.id;

    const [subject] = await baza.execute(`SELECT * FROM subjects WHERE id=?`, [
      id,
    ]);

    if ((subject as any).length === 0) {
      res.status(404).send({ message: "Not found" });
    }

    res.status(200).send((subject as any)[0]);
  }
);

app.get(
  "/api/lessons/subjectId/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    const Subjectid = +req.params.id;

    const [lessons] = await baza.execute(
      `SELECT * FROM lessons WHERE subjectId=?`,
      [Subjectid]
    );

    res.status(200).send(lessons);
  }
);

app.get("/api/lesson/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;

    const [rows]: any = await baza.execute(
      `SELECT * FROM lessons WHERE id=? `,
      [id]
    );

    const lesson = rows[0] as Lesson;

    if (lesson.content == null || lesson.summary == null) {
      const [subjectRows]: any = await baza.execute(
        `SELECT * FROM subjects WHERE id=?`,
        [lesson.subjectId]
      );

      const subject = subjectRows[0] as Subject;

      const [fileRows]: any = await baza.execute(
        `SELECT * FROM files WHERE subjectId=?`,
        [lesson.subjectId]
      );

      const file = fileRows as File[];

      const allphotosFiles: Photo[] = [];

        const [rowsPhoto]: any = await baza.execute(
          `SELECT * FROM photos WHERE subjectId=?`,
          [lesson.subjectId]
        );
        allphotosFiles.push(...rowsPhoto);


      const contents1: any = [
        {
          text: `
          
           You are teaching a lesson for the subject : ${
             subject.nameSubject
           }. The title of the lessson is ${lesson.title}.
           Use the language: ${subject.language}.

                     ${
                       subject.instructionAi
                         ? "follow these instructions if exists:" +
                           subject.instructionAi
                         : ""
                     }
                     ${
                       file.length > 0
                         ? "You have access to the following documentation files, which must be used as primary reference material when creating the lesson. Don't add extra general knowledge, focus on the material: \n  " +
                           file.map((x) => x.content).join("\n\n\n\n")
                         : ""
                     }
                     ${
                       allphotosFiles.length > 0
                         ? "take into account the attached photos"
                         : ""
                     }


           Develop a well-structured lesson content that can be delivered in no more than ${
             lesson.durationMinutes
           } minutes.
           Be clear, engaging, and informative.
           Format the output as HTML, with no html tag, head or body included. Do not use img tags.
          `,
        },
      ];

      for (let p of allphotosFiles) {
        contents1.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: p.content,
          },
        });
      }

      const resposeAI = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents1,
        config: {
          maxOutputTokens: 10000
        }
      });

      const contents2: any = [
        {
          text: `You are teaching a lesson for the subject : ${
            subject.nameSubject
          }.
                      The title of the lessson is ${lesson.title}.
                       Use the language: ${subject.language}.


                     ${
                       subject.instructionAi
                         ? "follow these instructions if exists:" +
                           subject.instructionAi
                         : ""
                     }
                     ${
                       file.length > 0
                         ? "You have access to the following documentation files, which must be used as primary reference material when creating the lesson. Don't add extra general knowledge, focus on the material.  \n  " +
                           file.map((x) => x.content).join("\n\n\n\n")
                         : ""
                     }
                     ${
                       allphotosFiles.length > 0
                         ? "take into account the attached photos"
                         : ""
                     }

                     Generate a clear and concise lesson summary with only the principal ideas that can be understood in exactly one minute. If appropriate, include a high-level lesson skeleton or outline.
                     Be clear, engaging, and informative. Keep your reply short and to the point.
                     Format the output as HTML, with no html tag, head or body included. Do not use img tags.
                      `,
        },
      ];

      for (let p of allphotosFiles) {
        contents2.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: p.content,
          },
        });
      }

      const resposeAiSummery = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents2,
        config: {
          maxOutputTokens: 3000
        }
      });

      const [summaryResponse, contentResponse] = await Promise.all([
        resposeAiSummery,
        resposeAI,
      ]);

      const summary = summaryResponse.text
        ?.replaceAll("```html", "")
        .replaceAll("```", "");
      const content = contentResponse.text
        ?.replaceAll("```html", "")
        .replaceAll("```", "");

      await baza.execute(
        `UPDATE lessons SET content=?, summary=? WHERE id=? `,
        [content, summary, id]
      );

      lesson.content = content || null;
      lesson.summary = summary || null;
    }

    res.status(201).send(lesson);
  } catch (error) {
    console.log("DB Read Error:", error);
    res.status(500).send({ message: "Server error" });
  }
});

app.put(
  "/api/lesson/edit/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = +req.params.id;

      const body = req.body as Lesson;

      await baza.execute(
        `UPDATE lessons SET content=?, summary=?, done=? WHERE id=?`,
        [body.content, body.summary, body.done, id]
      );

      res.status(200).send({ message: "Success" });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
      console.error("Error updating lesson:", error);
    }
  }
);

app.get(
  "/api/quizzes/subjectId/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const subjectId = +req.params.id;

      const [quizzes]: any = await baza.execute(
        `SELECT * FROM quiz WHERE subjectId=?`,
        [subjectId]
      );
      console.log("Quizzes from DB:", quizzes); // Debug
      res.status(200).send(quizzes);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
      console.error("Error get quizzes:", error);
    }
  }
);

app.get("/api/quiz/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;

    const [quiz] = await baza.execute(`SELECT * FROM quiz WHERE id=?`, [id]);

    if ((quiz as any).length === 0) {
      res.status(404).send({ message: "Not found" });
    }
    res.status(200).send((quiz as any)[0]);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
    console.error("Error get quiz:", error);
  }
});

app.get(
  "/api/questions/:quizId",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const quizId = +req.params.quizId;

      const [allQuestios]: any = await baza.execute(
        `SELECT * FROM questions WHERE quizId=?`,
        [quizId]
      );

      res.status(200).send(allQuestios);
    } catch (error) {
      res.status(500).send({ message: "Server error" });
      console.error("Error questions:", error);
    }
  }
);

app.post(
  "/api/addQuiz/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const subjectId = +req.params.id;

      const [lessons]: any = await baza.execute(
        "SELECT * FROM lessons WHERE subjectId=? AND done=1",
        [subjectId]
      );

      const [subject]: any = await baza.execute("SELECT * FROM subjects WHERE id=?", [subjectId])
      console.log(subject)

      const listaContent: string[] = lessons.map((l: Lesson) => l.content);

      const resposeAi = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
          Based on the following lessons content: 
          ${listaContent.join("\n\n\n\n\n")}.

           Use the language: ${subject[0].language}.
          
           Create a 10-questions quiz for possible answer only one is corect.

          
Each question should:
- Be clear and based only on the content provided.
- Include 4 answer options labeled A, B, C, D.
- Do not repeat questions.
- Keep the difficulty at an appropriate level for students who just finished the lessons.


Respond only with json if the following format:

 Question = {"content": string, "a": string, "b": string, "c": string, "d": string, "correctLetter": string}

 Return: array<Question>

`,
      });

      const response = resposeAi.text
        ?.replaceAll("```json", "")
        .replaceAll("```", "");

      const lista = JSON.parse(response!) as Question[];

      console.log(lista);

      const [insertResult]: any = await baza.execute(
        "INSERT INTO quiz (date, subjectId) VALUES (?,?)",
        [new Date().toISOString(), subjectId]
      );

      const quizId = +insertResult.insertId;

      console.log(quizId, insertResult);

      for (let q of lista) {
        await baza.execute(
          "INSERT INTO questions (content, `a`, `b`, `c`, `d`, correctLetter, quizId, answer) VALUES (?,?,?,?,?,?,?,?)",
          [q.content, q.a, q.b, q.c, q.d, q.correctLetter, quizId, null]
        );
      }

      res.status(200).send({ id: quizId });
    } catch (error) {
      console.log("Error:", error);
      res.status(500).send({ message: "Server error" });
    }
  }
);

app.put(
  "/api/question/update/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = +req.params.id;
      const body = req.body as Question[];

      for (let q of body) {
        await baza.execute(`UPDATE questions SET answer=? WHERE id=?`, [
          q.answer,
          q.id,
        ]);
      }

      res.status(200).send({ message: "Success" });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
      console.error("Error updating quiz:", error);
    }
  }
);

app.post(
  "/api/subscription",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userAuth?.sub;
      const { json } = req.body as Push;

      await baza.execute(`INSERT INTO push (userId, json) VALUES (?,?)`, [
        userId,
        json,
      ]);

      res.status(201).send({ message: "Push added successfully" });
    } catch (error) {
      console.log("DB Insert Error:", error);
      res.status(500).send({ message: "Server error" });
    }
  }
);

const notifJob = async () => {
  console.log("Cron job started at", new Date().toISOString());

  const nowUtc = dayjs().utc();

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYPASSWORD,
      database: process.env.MYSQDATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      multipleStatements: false,
      queueLimit: 0,
      timezone: "Z", // PT data in sql ,This 'Z' means UTC in MySQL2
    });

    // Select all subjects with push activated
    const [subjects]: any[] = await connection.execute(`
        SELECT * FROM subjects WHERE activatedPush = 1
      `);

    for (const subject of subjects) {
      try {
        // Current date/time in subject's timezone
        const localNow = nowUtc.tz(subject.timeZone);
        const today = localNow.format("YYYY-MM-DD");

        // Parse subject start/end dates in subject timezone
        const startDate = dayjs.tz(
          subject.startDate,
          "YYYY-MM-DD",
          subject.timeZone
        );
        const endDate = dayjs.tz(
          subject.endDate,
          "YYYY-MM-DD",
          subject.timeZone
        );

        // Check if subject is ongoing today
        const isInRange =
          (localNow.isSame(startDate, "day") ||
            localNow.isAfter(startDate, "day")) &&
          (localNow.isSame(endDate, "day") ||
            localNow.isBefore(endDate, "day"));

        if (!isInRange) continue;

        // Check if subject has lesson scheduled today
        const [lessons]: any[] = await connection.execute(
          `SELECT id FROM lessons WHERE subjectId = ? AND date = ?`,
          [subject.id, today]
        );

        if (lessons.length === 0) continue;

        // Check notification hour match
        if (localNow.hour() !== (subject.notificationTime || 10)) continue;

        // Fetch push subscriptions for user
        const [pushes]: any[] = await connection.execute(
          `SELECT json FROM push WHERE userId = ?`,
          [subject.userId]
        );

        if (pushes.length === 0) continue;

        const payload = JSON.stringify({
          notification: {
            title: `📚 ${subject.nameSubject}`,
            body: `You have a lesson today.`,
            icon: "/assets/icons/icon-192x192.png", // adjust to your icon path
            vibrate: [100, 50, 100],
            data: {
              onActionClick: {
                open: {
                  operation: "navigateLastFocusedOrOpen",
                  url: `/subject/${subject.id}`,
                },
              },
            },
            actions: [
              {
                action: "open",
                title: "Open Lesson",
                icon: "/assets/icons/open-icon.png", // optional
              },
            ],
          },
        });

        // Send notifications
        for (const push of pushes) {
          try {
            await WebPush.sendNotification(JSON.parse(push.json), payload);
            console.log(
              `Notification sent to user ${subject.userId} for subject ${subject.id}`
            );
          } catch (err) {
            console.error(`Failed to send push to user ${subject.userId}`, err);
          }
        }
      } catch (subjectErr) {
        console.error(`Error processing subject ID ${subject.id}`, subjectErr);
      }
    }
  } catch (err) {
    console.error("Cron job error:", err);
  } finally {
    if (connection) await connection.end();
  }

  console.log("Cron job finished at", new Date().toISOString());
};

cron.schedule("0 * * * *", notifJob);

(async () => {
  // await notifJob();
})();





const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});
