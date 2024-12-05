import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../sales-log/sales-log.component'; // Adjust the import path as necessary

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://65.0.71.23:8000/tasks'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task); // Use task.id for the specific task
  }
   // Method to save a task

}
