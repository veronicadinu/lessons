export interface AddSubjectRequest {

      nameSubject: string, 
      instructionAi: string | null |undefined,
      files: string[] | null |undefined,
      dateStart: string,
      dateEnd: string
      timePerDay:number
      maxLengthLesson:number | null |undefined,
      
}

