import { Routes } from '@angular/router';
import { SalesLogComponent } from './sales-log/sales-log.component';
import { TaskAddComponent } from './task-add/task-add.component'; // Import the standalone component
import { NotFoundComponent } from './not-found/not-found.component'; // Import a NotFoundComponent if you have one

export const routes: Routes = [
  { path: '', redirectTo: '/sales-log', pathMatch: 'full' },
  { path: 'sales-log', component: SalesLogComponent }, // Route for sales log
  { path: 'add-task', component: TaskAddComponent }, // Route for adding tasks
  { path: '**', component: NotFoundComponent }, // Catch-all route for 404
];
