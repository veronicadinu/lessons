export interface Subject {
      id: number
      nameSubject: string, 
      instructionAi: string | null ,
      dateStart: string,
      dateEnd: string
      timePerDay:number
      maxLengthLesson:number | null ,
      activatedPush: boolean 
      notificationTime: number | null
      timeZone: string
      
      
}
