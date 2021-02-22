import { Component, Inject, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/servicos/usuario.service';
import { Cliente } from 'src/app/interfaces/cliente';
import { AnimalEstimacao } from 'src/app/interfaces/animalEstimacao';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/servicos/local-storage.service';
import { USER_TOKEN } from 'src/app/util/constantes';
import { Endereco } from 'src/app/interfaces/endereco';
import { NotificationService } from 'src/app/servicos/notification.service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.scss'],
})
export class PerfilUsuarioComponent implements OnInit {
  animal:AnimalEstimacao = {
    nome: '',
    tipo: { id: 2, nome: 'GATO' },
  };

  usuario:Cliente;

  usuarioRequest:Cliente;

  isFormVisivel:Boolean = false;

  erroRequisicao:string;

  mensagemSucesso:string;

  constructor(private usuarioService:UsuarioService,
              private router:Router,
              private localStorageService: LocalStorageService,
              @Inject('AnimalNotificationService') private animalNotification: NotificationService<AnimalEstimacao>) { }

  ngOnInit(): void {
    this.getUsuario();
    this.limpaAnimal();
  }

  selecionaAnimal(animalEstimacao:AnimalEstimacao): void {
    this.animal = { ...animalEstimacao };
    this.exibeFormulario();
  }

  getUsuario() : void {
    this.localStorageService.getItem(USER_TOKEN).subscribe((token : string) => {
      this.usuarioService.getUsuario(token)
        .subscribe((usuario:Cliente) => {
          this.usuario = usuario;
        }, (err) => this.handleError(err));
    }, (err) => this.handleError(err));
  }

  adicionaAnimal({ ...animalEstimacao }:AnimalEstimacao) : void {
    const animal = { ...animalEstimacao, donoId: this.usuario.id };
    this.localStorageService.getItem(USER_TOKEN).subscribe((token : string) => {
      this.usuarioService.adicionarAnimalEstimacao(animal, token).subscribe((obj) => {
        this.limpaAnimal();
        this.getUsuario();
        this.animalNotification.notify(obj);
        this.isFormVisivel = false;
      }, (err) => this.handleError(err));
    }, (err) => this.handleError(err));
  }

  removeAnimal(animalEstimacao : AnimalEstimacao):void {
    this.localStorageService.getItem(USER_TOKEN).subscribe((token : string) => {
      this.usuarioService.removerAnimalEstimacao(animalEstimacao.id, token).subscribe(() => {
        this.getUsuario();
      }, (err) => this.handleError(err));
    }, (err) => this.handleError(err));
  }

  exibeFormulario() {
    this.erroRequisicao = null;
    this.mensagemSucesso = null;
    this.isFormVisivel = true;
  }

  ocultaFormulario() {
    this.isFormVisivel = false;
  }

  atualizaUsuario() {
    this.localStorageService.getItem(USER_TOKEN).subscribe((token : string) => {
      this.usuarioService.atualizaUsuario(this.usuarioRequest, token).subscribe(() => {
        this.getUsuario();
        this.limpaAnimal();
        this.ocultaFormulario();
        this.usuarioRequest = null;
        this.mensagemSucesso = 'Operação realizada com sucesso';
      });
    },
    (error) => {
      this.handleError(error);
    });
  }

  editaAnimal(animalEstimacao : AnimalEstimacao) : void {
    this.localStorageService.getItem(USER_TOKEN).subscribe((token : string) => {
      this.usuarioService.atualizarAnimalEstimacao(animalEstimacao.id, animalEstimacao, token)
        .subscribe(() => {
          this.getUsuario();
          this.limpaAnimal();
          this.ocultaFormulario();
        },
        (err) => this.handleError(err));
    },
    (err) => this.handleError(err));
  }

  limpaAnimal() {
    this.animal = {
      nome: '',
      tipo: { id: 2, nome: 'GATO' },
    };
  }

  cancelar() {
    this.isFormVisivel = false;
    this.limpaAnimal();
  }

  atualizaEndereco(endereco:Endereco):void {
    this.usuarioRequest = { ...this.usuario };
    this.usuarioRequest.endereco = endereco;
    this.atualizaUsuario();
  }

  alteraTelefone(telefone:string):void {
    this.usuarioRequest = { ...this.usuario };
    this.usuarioRequest.telefone = telefone;
    this.atualizaUsuario();
  }

  handleError(err) {
    this.erroRequisicao = typeof err === 'string' ? err : 'ERRO_REQUISICAO';
  }
}
