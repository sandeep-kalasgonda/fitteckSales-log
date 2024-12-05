import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './sales-log.component'; // Adjust the path if necessary

@Injectable({
  providedIn: 'root', // This makes the service available at the root level
})
export class TaskService {
  private apiUrl = 'http://65.0.71.23:8000/tasks'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Method to get all tasks
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // Method to save a new task
  saveTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task); // Adjust according to your API
  }

  // Method to update an existing task
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task); // Use task.id for the specific task
  }

  // Method to delete a task by ID
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`); // Delete the task by ID
  }

  // Method to duplicate a task
  duplicateTask(task: Task): Observable<Task> {
    const newTask = { ...task, id: this.generateNewId() }; // Create a new task with a new ID
    return this.http.post<Task>(this.apiUrl, newTask); // Save the duplicated task to the database
  }

  // Helper method to generate a new ID for duplicated tasks
  private generateNewId(): number {
    // Placeholder logic for generating a new ID
    // This should ideally be handled by the backend to ensure uniqueness
    return Math.floor(Math.random() * 10000); // Simple random ID generation
  }
}
