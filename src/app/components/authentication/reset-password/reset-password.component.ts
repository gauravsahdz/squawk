import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import * as EmailValidator from 'email-validator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: any;
  returnUrl: string = '';
  show: boolean = false;
  eyeHidden: boolean = true;
  eyeShown: boolean = false;
  errorPassword: string = '';
  errorPasswordConfirm: string = '';
  currentState: any;
  resetToken: null | undefined;

  constructor(
    private authService: AuthService,
    public http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private apiService: ApiService,
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/todos']);
    }

    // this.currentState = 'Wait';
     this.route.params.subscribe(params => {
      this.resetToken = params['token'];
      // console.log(this.resetToken);
    //   this.VerifyToken();
    });
  }

  ngOnInit(): void {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    });

   //if password is less than 8 or more than 15 characters show error
   this.resetPasswordForm.get('password').valueChanges.subscribe((value: string ) => {
    if (value.length < 8 || value.length > 15) {
      this.errorPassword = 'Password must be between 8 and 15 characters';
    } else {
      this.errorPassword = '';
    }
  }
  );

  //if password confirm is not equal to password show error
  this.resetPasswordForm.get('passwordConfirm').valueChanges.subscribe((value: string) => {
    if (value !== this.resetPasswordForm.get('password').value) {
      this.errorPasswordConfirm = 'Passwords do not match';
    } else {
      this.errorPasswordConfirm = '';
    }
  }
  );

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/todos';
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  passwordShown() {
    this.show = !this.show;
    this.eyeShown = false;
    this.eyeHidden = true;
  }

  passwordHidden() {
    this.show = !this.show;
    this.eyeShown = true;
    this.eyeHidden = false;
  }

  VerifyToken() {
    this.authService.ValidPasswordToken({resettoken: this.resetToken}).subscribe(
      (data: any) => {
        this.currentState = 'Verified';
      },
      (err: any) => {
        this.currentState = 'NotVerified';
      }
    );
  }

  changePassword() {
    // console.log(this.resetToken);
    if (this.resetPasswordForm.valid) {
      this.authService.resetPassword(this.resetToken ,this.resetPasswordForm.value).subscribe({
        next: (res: any) => {
          this._snackBar.open('✔ Password Changed Successfully.', 'X', {
            duration: 2000,
            panelClass: ['success-snackbar'],
            verticalPosition: 'top',
          });
          this.apiService.loader.next(false);
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
         if(err.status == 400){
          this._snackBar.open('✗ Token is invalid or has expired.', 'X', {
            duration: 2000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          });
         }
         else{
          this._snackBar.open('✗ Something went wrong.', 'X', {
            duration: 2000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top',
          });
         }
          this.apiService.loader.next(false);
        }
      }
      );
    } else {
      this.errorPassword = this.resetPasswordForm.get('password').errors.required ? 'Password is required' : '';
      this.errorPasswordConfirm = this.resetPasswordForm.get('passwordConfirm').errors.required ? 'Password Confirm is required' : '';
      this.apiService.loader.next(false);
    }
  }
}
