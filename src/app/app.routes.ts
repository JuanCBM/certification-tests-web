import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { ResultsComponent } from './pages/results/results.component';

// Parent route is required for GitHub Pages deployments (repository root path)
const BASE_PATH = 'certification-tests-web';

export const APP_ROUTES: Routes = [
  {
    path: BASE_PATH,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'quiz', component: QuizComponent },
      { path: 'results', component: ResultsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '**', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: BASE_PATH, pathMatch: 'full' },
  { path: '**', redirectTo: BASE_PATH, pathMatch: 'full' }
];