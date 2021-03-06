import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Login } from 'src/app/interfaces/login';
import { LocalStorageService } from 'src/app/servicos/local-storage.service';
import { LoginService } from 'src/app/servicos/login.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MyErrorStateMatcher } from 'src/app/classes/my-error-state-matcher';
import { USER_TOKEN } from 'src/app/util/constantes';
import { DataSharingService } from 'src/app/servicos/data-sharing.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  login:Login = {
    email: '',
    senha: '',
  };

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  errorMessage : string = '';

  foiAtivo:boolean = false;

  redirectTo:string = '';

  passwordFormControl = new FormControl('', [
    Validators.required,
  ]);

  matcher = new MyErrorStateMatcher();

  constructor(private loginService:LoginService,
              private localStorageService:LocalStorageService,
              private router:Router,
              private dataSharing:DataSharingService,
              private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.localStorageService.getItem(USER_TOKEN)
      .subscribe((token) => {
        if (token) {
          this.dataSharing.isUsuarioLogado.next(true);
          this.router.navigate(['/perfil']);
        }
      });
    this.route.queryParams.subscribe((params:Params) => {
      const isAtivo:boolean = !!(params.ativo) || false;
      this.foiAtivo = isAtivo;
      this.redirectTo = params.redirectTo || '/perfil';
    });
  }

  hasErrors() {
    return this.emailFormControl.hasError('email') || this.emailFormControl.hasError('required') || this.passwordFormControl.hasError('required');
  }

  redirect() {
    this.router.navigate([this.redirectTo]);
  }

  realizaLogin() {
    this.loginService.realizaLogin(this.login).subscribe(
      (token) => {
        this.localStorageService.setItem(USER_TOKEN, token).subscribe(() => {
          this.dataSharing.isUsuarioLogado.next(true);
          this.redirect();
        });
      },
      (error) => {
        this.errorMessage = typeof error === 'string' ? error : 'ERRO_REQUISICAO';
        this.login.senha = '';
      },
    );
  }
}
