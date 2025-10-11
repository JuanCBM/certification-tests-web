import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {QuizComponent} from './pages/quiz/quiz.component';
import {ResultsComponent} from './pages/results/results.component';

export const APP_ROUTES: Routes = [
  {path: 'home', component: HomeComponent},
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {path: 'quiz', component: QuizComponent},
  {path: 'results', component: ResultsComponent},
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }];