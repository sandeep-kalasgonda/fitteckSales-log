import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TaskService } from './task.service'; // Adjust path as necessary
import { MatDialog } from '@angular/material/dialog';
import { TaskAddComponent } from '../task-add/task-add.component';
import { GenericDialogComponent } from '../generic-dialog/generic-dialog.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface Task {
  id: number; // Ensure that the Task interface includes an id
  date: string;
  entity: string;
  taskType: string;
  time: string;
  contactPerson: string;
  notes: string;
  status: string;
}

@Component({
  selector: 'app-sales-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    RouterModule,
    HttpClientModule,
    GenericDialogComponent
  ],
  templateUrl: './sales-log.component.html',
  styleUrls: ['./sales-log.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalesLogComponent implements OnInit {
  taskTypes: string[] = ['Call', 'Meeting', 'Video Call'];
  displayedColumns: string[] = ['date', 'entity', 'taskType', 'time', 'contactPerson', 'notes', 'status', 'options'];
  dataSource = new MatTableDataSource<Task>();
  searchQuery: string = '';
  selectedDateFilter: string = '';
  selectedTaskTypes: string[] = [];
  showTaskTypeFilter: boolean = false;
  isEditing: boolean[] = [];
  loading: boolean = false; // Loading indicator
  private searchSubject = new Subject<string>(); // Subject for debouncing search input

  constructor(private taskService: TaskService, public dialog: MatDialog) {}

  ngOnInit() {
    this.fetchTasks(); // Fetch tasks when the component initializes

    // Subscribe to search input changes with debounce
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.searchQuery = query;
      this.applyFilter();
    });
  }

  fetchTasks() {
    this.loading = true; // Start loading
    this.taskService.getTasks().subscribe(
      (tasks: Task[]) => {
        this.dataSource.data = tasks;
        this.isEditing = new Array(tasks.length).fill(false); // Initialize editing states
        this.loading = false; // Stop loading
      },
      (error) => {
        console.error('Error fetching tasks', error);
        this.loading = false; // Stop loading on error
      }
    );
  }

  toggleTaskTypeSelection(type: string): void {
    const index = this.selectedTaskTypes.indexOf(type);
    if (index === -1) {
      this.selectedTaskTypes.push(type);
    } else {
      this.selectedTaskTypes.splice(index, 1);
    }
    this.applyFilter();
  }

  clearTaskTypeFilter() {
    this.selectedTaskTypes = [];
    this.applyFilter();
  }

  toggleDateFilter(filter: string): void {
    this.selectedDateFilter = this.selectedDateFilter === filter ? '' : filter; // Toggle the filter
    this.applyFilter(); // Apply the filter whenever the selection changes
  }



  
  applyFilter() {
    this.dataSource.filterPredicate = (data: Task, filter: string) => {
      const filterValues = JSON.parse(filter);
      
      const entityMatch = this.searchQuery
        ? data.entity.toLowerCase().includes(filterValues.searchQuery)
        : true;

      const dateMatch = this.selectedDateFilter
        ? this.isDateMatch(data.date, this.selectedDateFilter) // Check date match
        : true;

      const taskTypeMatch = filterValues.taskType.length > 0
        ? filterValues.taskType.includes(data.taskType)
        : true;

      return entityMatch && dateMatch && taskTypeMatch; // Return true if all conditions are met
    };

    const filterValue = {
      searchQuery: this.searchQuery.toLowerCase(),
      taskType: this.selectedTaskTypes
    };

    this.dataSource.filter = JSON.stringify(filterValue);
  }

  private isDateMatch(taskDate: string, filter: string): boolean {
    const date = new Date(taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for comparison

    switch (filter) {
      case 'today':
        return date.toDateString() === today.toDateString(); // Compare dates
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Get the start of the week
        return date >= startOfWeek && date <= today; // Check if within this week
      case 'thisMonth':
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear(); // Check if in the current month
      default:
        return false;
    }
  }

  
  onSearchChange(query: string) {
    this.searchSubject.next(query); // Emit search query
  }

  
  
  clearDateFilter(): void {
    this.selectedDateFilter = ''; // Clear the selected date filter
    this.applyFilter(); // Reapply the filter to refresh the displayed tasks
  }

  removeTaskType(taskType: string) {
    const index = this.selectedTaskTypes.indexOf(taskType);
    if (index >= 0) {
      this.selectedTaskTypes.splice(index, 1);
      this.applyFilter();
    }
  }

  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskAddComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New Task:', result);
        this.fetchTasks(); // Optionally refresh the task list
      }
    });
  }

  editNotes(index: number) {
    const currentNotes = this.dataSource.data[index].notes;
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {
        title: 'Edit Notes',
        entity: this.dataSource.data[index].entity,
        notes: currentNotes,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.data[index].notes = result.notes;
        this.saveNotes(index);
      }
    });
  }

  saveNotes(index: number) {
    const taskToUpdate = this.dataSource.data[index];
    this.taskService.updateTask(taskToUpdate).subscribe(
      () => {
        console.log('Notes saved for index', index);
      },
      (error) => {
        console.error('Error updating notes', error);
      }
    );
  }

  cancelEdit(index: number) {
    this.isEditing[index] = false; // Cancel editing
  }

  toggleStatus(element: Task): void {
    element.status = element.status === 'Open' ? 'Closed' : 'Open'; // Toggle status
    this.taskService.updateTask(element).subscribe(
      () => {
        console.log('Status updated to', element.status);
      },
      (error) => {
        console.error('Error updating status', error);
      }
    );
  }

  // Method to delete task
  deleteTask(element: Task): void {
    this.taskService.deleteTask(element.id).subscribe(
      () => {
        const index = this.dataSource.data.indexOf(element);
        if (index >= 0) {
          this.dataSource.data.splice(index, 1); // Remove the task from the data source
          this.dataSource._updateChangeSubscription(); // Refresh the data source
          console.log('Task deleted:', element);
        }
      },
      (error) => {
        console.error('Error deleting task', error);
      }
    );
  }

  // Method to edit task
  editTask(element: Task): void {
    // Open the dialog and pass the task data
    const dialogRef = this.dialog.open(TaskAddComponent, {
      data: element // Pass the existing task data to the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the task in the service and refresh the data
        this.taskService.updateTask(result).subscribe(
          () => {
            const index = this.dataSource.data.findIndex(task => task.id === element.id);
            this.dataSource.data[index] = result; // Update the task with the new data
            this.dataSource._updateChangeSubscription(); // Refresh the data source
            console.log('Task updated:', result);
          },
          (error) => {
            console.error('Error updating task', error);
          }
        );
      }
    });
  }

  // Method to duplicate task
  duplicateTask(element: Task): void {
    const newTask: Task = { ...element, id: this.generateNewId() }; // Create a new task with a new ID
    this.taskService.saveTask(newTask).subscribe(
      (savedTask) => {
        this.dataSource.data.push(savedTask); // Add the new task to the data source
        this.dataSource._updateChangeSubscription(); // Refresh the data source
        console.log('Task duplicated:', savedTask);
      },
      (error) => {
        console.error('Error duplicating task', error);
      }
    );
  }

  // Helper method to generate a new ID for duplicated tasks
  private generateNewId(): number {
    return Math.max(...this.dataSource.data.map(task => task.id)) + 1; // Simple ID generation logic
  }
} 