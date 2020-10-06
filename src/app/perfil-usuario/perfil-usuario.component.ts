import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../servicos/usuario.service';
import { Cliente } from '../interfaces/cliente';
import { AnimalEstimacao } from '../interfaces/animalEstimacao';
import { TipoAnimal } from '../enum/TipoAnimal';
import { Router } from '@angular/router';
import { LocalStorageService } from '../servicos/local-storage.service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.scss']
})
export class PerfilUsuarioComponent implements OnInit {
  animal:AnimalEstimacao = {
    nome: "",
    tipo: {id: 2, nome: 'GATO'}
  };
  usuario:Cliente;
  usuarioRequest:Cliente;
  isFormVisivel:Boolean = false;
  erroRequisicao:String;
  mensagemSucesso:String;
  constructor(private usuarioService:UsuarioService,
              private router:Router,
              private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.getUsuario();
    this.limpaAnimal();
  }

  selecionaAnimal(animalEstimacao:AnimalEstimacao): void {
    this.animal = {...animalEstimacao};
    this.exibeFormulario();
  }

  getUsuario() : void {
    this.localStorageService.getItem('token').subscribe((token: number) => {
      this.usuarioService.getUsuario(token)
      .subscribe((usuario:Cliente) => {
        if(!usuario) {
          this.router.navigate(['/login']);
          return;
        }
        this.usuario = usuario
      });
    });    
  }

  adicionaAnimal({...animalEstimacao}:AnimalEstimacao) : void {
    this.usuarioService.adicionarAnimalEstimacao(animalEstimacao).subscribe(() => {
      this.getUsuario();
    });    
  }

  removeAnimal(animalEstimacao : AnimalEstimacao):void {
   this.usuarioService.removerAnimalEstimacao(animalEstimacao.id).subscribe(() => {
     this.getUsuario();
   });
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
    this.usuarioService.atualizaUsuario(this.usuarioRequest).subscribe(res => {
      this.localStorageService.setItem('token', res.id).subscribe(() => {
        this.getUsuario();
        this.limpaAnimal();
        this.ocultaFormulario();
        this.usuarioRequest = null;
        this.mensagemSucesso = "Operação realizada com sucesso";
      });
    },
    ({error}) => {
      console.log(error);
      this.erroRequisicao = "Erro durante a operação";
    });
  }

  editaAnimal(animalEstimacao : AnimalEstimacao) : void { 
    console.log(animalEstimacao);
    this.usuarioService.atualizarAnimalEstimacao(animalEstimacao.id, animalEstimacao).subscribe(res => {
      this.getUsuario();
      this.limpaAnimal();
      this.ocultaFormulario();
    })
  }

  buscarTiposAnimalEstimacao() {
    let tiposAnimal;

    this.usuarioService.buscarTiposAnimalEstimacao().subscribe(tipos => 
      {
        console.log(tipos)
        tiposAnimal = tipos;
      })

    return tiposAnimal;
  }


  limpaAnimal() {
    this.animal = {
      nome: "",
      tipo: {id: 2, nome: 'GATO'}
    }
  }

  cancelar() {
    this.isFormVisivel = false;
    this.limpaAnimal();
  }
}
