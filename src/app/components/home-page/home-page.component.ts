import { Component, isDevMode, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { VerifyDialogComponent } from '../verify-dialog/verify-dialog.component';
import { MarkAsCompletedTodoDialogComponent } from '../mark-as-completed-todo-dialog/mark-as-completed-todo-dialog.component';
import { HttpClient } from '@angular/common/http';
import { AddTodoDialogComponent } from '../add-todo-dialog/add-todo-dialog.component';
import { EditTodoDialogComponent } from '../edit-todo-dialog/edit-todo-dialog.component';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { TodoServiceService } from 'src/app/services/todo-service.service';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  todosForm: any;
  todos: any = [];
  actionBtnText: string = 'Add';
  formData: any;
  updateTodosId: any;
  actionTitle: string = 'Create';
  errorTitle: string = '';
  errorDesc: string = '';
  scrollIcon: boolean = true;

  userDetails: any = [];
  currentUser!: User;

  todoStatus: string = 'active';
  StatusOfTodos: any = [];

  constructor(
    private apiService: ApiService,
    public http: HttpClient,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private authService: AuthService,
    private todoService: TodoServiceService
  ) {
    this.authService.currentUser.subscribe((x) => (this.currentUser = x));
  }

  ngOnInit(): void {
    this.todosForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.getUserDetails();
    this.getActiveTodos();
    // this.getTodos(this.todoStatus);
    this.getTodoByStatus();
    // this.todoService.getStatusTodos();

    //if title is less than 5 or more than 15 characters show error
    this.todosForm.get('title').valueChanges.subscribe((value: string) => {
      if (value.length < 5 || value.length > 15) {
        this.errorTitle = 'Title must be between 5 and 15 characters';
      } else {
        this.errorTitle = '';
      }
    });

    //if description is less than 10 or more than 100 characters show error
    this.todosForm
      .get('description')
      .valueChanges.subscribe((value: string) => {
        if (value.length < 10 || value.length > 100) {
          this.errorDesc = 'Description must be between 10 and 100 characters';
        } else {
          this.errorDesc = '';
        }
      });
  }

  resetForm() {
    this.todosForm.reset();
    this.actionBtnText = 'Add';
    this.actionTitle = 'Create';
  }

  openAddDialog() {
    this.dialog
      .open(AddTodoDialogComponent, {
        width: '481px',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res.value === 'added') {
          this.getTodoByStatus();
          // this.getTodos('active');
          this._snackBar.open('✔ Added successfully', 'X', {
            duration: 2000,
            panelClass: ['success-snackbar'],
            verticalPosition: 'top',
          });
          this.apiService.loader.next(false);
        }
      });
  }

  editDialogTodo(items: any) {
    this.dialog
      .open(EditTodoDialogComponent, {
        width: '565px',
        data: items,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res.value === 'edited') {
          this.getTodoByStatus();
          // this.getTodos('active');
          this._snackBar.open('✔ Updated successfully', 'X', {
            duration: 2000,
            panelClass: ['success-snackbar'],
            verticalPosition: 'top',
          });
        }
      });
  }

  getUserDetails() {
    this.apiService
      .getCurrentUser(this.currentUser['data'].user._id)
      .subscribe({
        next: (res: any) => {
          // console.log({ res });
        },
        error: (err) => {
          // console.log({ err });
        },
      });
  }

  getTodoByStatus() {
    this.todoService.getStatusTodos().subscribe({
      next: (res: any) => {
        this.todos = res;
        this.StatusOfTodos = res[0].status;
        this.apiService.loader.next(false);
        console.log('listing of datas in homepage: ', this.todos);
      },
      error: (err: { error: { message: string } }) => {
        this._snackBar.open('✗ ' + err.error.message, 'X', {
          duration: 2000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
        });
        this.apiService.loader.next(false);
      },
    });
  }


  getTodos(StatusOfTodos: any) {
    this.apiService
      .todosByStatus(this.currentUser['data'].user.uniqueID, this.StatusOfTodos)
      .subscribe({
        next: (res) => {
          this.todos = res.data.todos;
          this.apiService.loader.next(false);
          // console.log('listing of datas: ', this.todos);
        },
        error: (err) => {
          this._snackBar.open('✗ ' + err.error.message, 'X', {
            duration: 2000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          });
          this.apiService.loader.next(false);
        },
      });
  }

  getActiveTodos() {
    this.apiService
      .todosByStatus(this.currentUser['data'].user.uniqueID, 'active')
      .subscribe({
        next: (res) => {
          this.todos = res.data.todos;
          this.apiService.loader.next(false);
          // console.log('listing of datas: ', this.todos);
        },
        error: (err) => {
          this._snackBar.open('✗ ' + err.error.message, 'X', {
            duration: 2000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          });
          this.apiService.loader.next(false);
        },
      });
  }

  addTodos() {
    //if the form is not getting edited then add the todo else update the todo
    if (this.actionBtnText === 'Add') {
      if (this.todosForm.valid) {
        this.apiService
          .addDatas(
            this.todosForm.value,
            this.currentUser['data'].user.uniqueID
          )
          .subscribe({
            next: (res) => {
              this._snackBar.open('✔ Added successfully', 'X', {
                duration: 2000,
                panelClass: ['success-snackbar'],
                verticalPosition: 'top',
              });
              this.getTodoByStatus();
              this.getTodos(this.StatusOfTodos);
              this.apiService.loader.next(false);
              this.todosForm.reset();
            },
            error: (err) => {
              this._snackBar.open('✗ ' + err.error.message, 'X', {
                duration: 2000,
                panelClass: ['error-snackbar'],
                verticalPosition: 'top',
              });
              this.apiService.loader.next(false);
            },
          });
      } else {
        // console.log('Please fill all the fields!');
        this.apiService.loader.next(false);
      }
    } else {
      this.updateTodos();
    }
  }

  editTodo(items: any) {
    // fetch the saved title and description and set it to the form
    this.todosForm.patchValue({
      title: items.title,
      description: items.description,
    });
    this.actionBtnText = 'Update';
    this.actionTitle = 'Edit';
    this.updateTodosId = items._id;
  }

  updateTodos() {
    //fetch the id of the selected todo and pass it to the api service
    this.apiService
      .updateDatas(this.todosForm.value, this.updateTodosId)
      .subscribe({
        next: (res) => {
          this._snackBar.open('✔ Updated successfully', 'X', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          this.todosForm.reset();
          this.actionBtnText = 'Add';
          this.actionTitle = 'Create';
          this.apiService.loader.next(false);
          this.getTodoByStatus();
          this.getTodos(this.StatusOfTodos);
        },
        error: (err) => {
          this._snackBar.open('✗ ' + err.error.message, 'X', {
            duration: 2000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          });
          this.apiService.loader.next(false);
        },
      });
  }

  // function to delete the todo
  deleteTodos(id: any) {
    this.dialog
      .open(VerifyDialogComponent, {
        width: '481px',
        data: id,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res.value === 'deleted') {
          this.getTodoByStatus();
          this.getTodos(this.StatusOfTodos);
          this._snackBar.open('✔ Deleted successfully', 'X', {
            duration: 2000,
            panelClass: ['success-snackbar'],
            verticalPosition: 'top',
          });
        }
      });
  }

  // function to mark the todo as completed
  markAsCompleted(id: any) {
    this.dialog.open(MarkAsCompletedTodoDialogComponent, {
      width: '481px',
      data: id,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res.value === 'completed') {
          this.apiService.loader.next(true);
          this.getTodoByStatus();
          this.getTodos(this.StatusOfTodos);
          this._snackBar.open('✔ Marked as completed', 'X', {
            duration: 2000,
            panelClass: ['success-snackbar'],
            verticalPosition: 'top',
          });
        }
      });

  }
}
