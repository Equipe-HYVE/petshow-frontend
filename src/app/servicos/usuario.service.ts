import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Usuario } from '../interfaces/usuario';
import { NGXLogger } from 'ngx-logger';
import { LocalStorageService } from './local-storage.service';
import { usuariosMock } from '../mocks/usuarioMock';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  public USUARIO_SERVICE_URL = `${environment.API_URL}contas`;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-type' : 'application/json'})
  }

  constructor(private http:HttpClient, 
              private logger: NGXLogger,
              private storageService:LocalStorageService) { }

  

  getUsuario = (id:number): Observable<Usuario> => {
    const url = `${this.USUARIO_SERVICE_URL}/${id}`;
    return this.http.get<Usuario>(url)
    .pipe(
      tap(_ => this.logger.info(`Request feito a ${url}`)),
      catchError(this.handleError<Usuario>(`Falha em requisição feita a ${url}`))
    );
  }

  private handleError<T> (mensagem: string, result?: T) {
    return (error:any) : Observable<T> => {
      this.logger.error(mensagem);
      return of(result as T);
    }
  }

  buscaUsuarioStorage = () => {
    return this.storageService.getItem('usuario');
  }

  atualizaUsuario = (usuario:Usuario) : Observable<Usuario> => {
    return this.http.put<Usuario>(this.USUARIO_SERVICE_URL, usuario, this.httpOptions)
    .pipe(
      tap(_ => this.logger.info(`Request feito a ${this.USUARIO_SERVICE_URL}`)),
      catchError(this.handleError<Usuario>('update'))
    );
  } 
}
