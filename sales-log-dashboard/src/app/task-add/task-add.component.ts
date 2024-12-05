import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TaskService } from '../sales-log/task.service'; // Adjust path as necessary
import { MatSnackBar } from '@angular/material/snack-bar'; // Import for notifications
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker'; // Import for datepicker
import { MatNativeDateModule } from '@angular/material/core'; // Import for native date handling
import { Task } from '../sales-log/sales-log.component'; // Adjust path as necessary

@Component({
  selector: 'app-task-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    MatDatepickerModule, // Add datepicker module
    MatNativeDateModule // Add native date module
  ],
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.css'],
})
export class TaskAddComponent implements OnInit {
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TaskAddComponent>,
    private router: Router,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Task // Injecting the task data
  ) {
    // Initialize the form
    this.taskForm = this.fb.group({
      entity: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      taskType: ['', Validators.required],
      phoneNumber: [''], // Optional field
      contactPerson: ['', Validators.required],
      notes: [''],
      status: ['Open'], // Default value
    });
  }

  ngOnInit(): void {
    // If data is provided, populate the form with existing task data
    if (this.data) {
      this.taskForm.patchValue(this.data);
      this.taskForm.get('date')?.setValue(new Date(this.data.date)); // Convert date if needed
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(event: Event): void {
    event.preventDefault(); // Prevent default form submission
    if (this.taskForm.valid) {
      // Prepare the data for submission
      const formData = this.taskForm.value;
  
      // Log the data for debugging
      console.log('Submitting task with data:', { ...this.data, ...formData });
  
      // Format date and time if necessary
      formData.date = new Date(formData.date).toISOString(); // Convert to ISO string if needed
  
      // Ensure the time is in the correct format (HH:MM:SS)
      const timeParts = formData.time.split(':');
      if (timeParts.length === 2) {
        formData.time = `${timeParts[0]}:${timeParts[1]}:00`; // Append :00 for seconds
      }
  
      if (this.data?.id) {
        // Update the task using PUT if an ID exists
        this.taskService.updateTask({ ...this.data, ...formData }).subscribe(
          () => {
            // Show success message
            this.snackBar.open('Task updated successfully!', 'Close', {
              duration: 2000,
            });
  
            // Close the dialog
            this.dialogRef.close(); // Close the dialog after saving
  
            // Redirect to sales log page after a brief delay
            setTimeout(() => {
              this.router.navigate(['/sales-log']); // Adjust the route as necessary
            }, 1000); // Redirect after 1 second
          },
          (error) => {
            // Handle error case (e.g., show an error message)
            console.error('Error updating task', error); // Log the error for debugging
            this.snackBar.open('Failed to update task. Please try again.', 'Close', {
              duration: 3000,
            });
          }
        );
      } else {
        // Create a new task using POST if no ID exists
        this.taskService.saveTask(formData).subscribe(
          (newTask) => {
            // Show success message
            this.snackBar.open('Task created successfully!', 'Close', {
              duration: 2000,
            });
  
            // Close the dialog
            this.dialogRef.close(); // Close the dialog after saving
  
            // Redirect to sales log page after a brief delay
            setTimeout(() => {
              this.router.navigate(['/sales-log']); // Adjust the route as necessary
            }, 1000); // Redirect after 1 second
          },
          (error) => {
            // Handle error case (e.g., show an error message)
            console.error('Error creating task', error); // Log the error for debugging
            this.snackBar.open('Failed to create task. Please try again.', 'Close', {
              duration: 3000,
            });
          }
        );
      }
    } else {
      // Show validation errors if the form is invalid
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 3000,
      });
    }
  }
}  