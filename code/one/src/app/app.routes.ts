import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MySubjectsComponent } from './my-subjects/my-subjects.component';
import { AddSubjectComponent } from './add-subject/add-subject.component';
import { SubjectIdComponent } from './subject-id/subject-id.component';
import { LessonIdComponent } from './lesson-id/lesson-id.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';

export const routes: Routes = [

{path:"", component: HomeComponent},
{path:"subjects", component: MySubjectsComponent, canActivate: [autoLoginPartialRoutesGuard],},
{path:"addSubject", component: AddSubjectComponent, canActivate: [autoLoginPartialRoutesGuard],},
{path:"subject/:id", component: SubjectIdComponent, canActivate: [autoLoginPartialRoutesGuard],},
{path:"lesson/:id", component: LessonIdComponent, canActivate: [autoLoginPartialRoutesGuard],},

{path: '**' , component: NotFoundComponent},



];
