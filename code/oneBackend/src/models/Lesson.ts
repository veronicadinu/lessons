export interface Lesson {
    id: number,
    subjectId:number,
    title: string,
    durationMinutes: number,
    date: string,
    content: string | null,
    summary: string | null,
    done: boolean
}