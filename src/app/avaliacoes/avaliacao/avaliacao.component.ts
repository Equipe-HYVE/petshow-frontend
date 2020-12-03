import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AvaliacaoService } from 'src/app/servicos/avaliacao.service';
import { ServicoDetalhado } from 'src/app/interfaces/servico-detalhado';
import { Router } from '@angular/router';
import { Avaliacao } from 'src/app/interfaces/avaliacao';
import { LocalStorageService } from 'src/app/servicos/local-storage.service';
import { Cliente } from 'src/app/interfaces/cliente';
import { USER_TOKEN } from 'src/app/util/constantes';
import { UsuarioService } from 'src/app/servicos/usuario.service';
import { TipoPessoa } from 'src/app/enum/tipo-pessoa.enum';
import { PrestadorService } from 'src/app/servicos/prestador.service';
import { servicos } from 'src/app/mocks/servico-detalhado-mock';
import { DataSharingService } from 'src/app/servicos/data-sharing.service';
import { PageEvent } from '@angular/material/paginator';
import { ObjetoPaginado } from 'src/app/interfaces/paginacao';
import { ContaService } from 'src/app/servicos/conta.service';

@Component({
  selector: 'app-avaliacao',
  templateUrl: './avaliacao.component.html',
  styleUrls: ['./avaliacao.component.scss']
})
export class AvaliacaoComponent implements OnInit {
  avaliacoes: Avaliacao[];
  isLogado:boolean = false;
  isFormVisible:boolean = false;
  servicoAvaliado:ServicoDetalhado;
  idPrestador:number;
  idServico:number;
  isNotFound:boolean = false;
  isCliente:boolean = false;
  avaliacaoBase:Avaliacao = {
    atencao:0,
    qualidadeProdutos:0,
    custoBeneficio:0,
    infraestrutura:0,
    qualidadeServico:0,
    comentario: null
  }

  pageEvent: PageEvent;
  quantidadeTotal:number;
  quantidadeItens:number = 10;
  paginaAtual:number = 0;

  constructor(private route:ActivatedRoute,
              private avaliacaoService:AvaliacaoService,
              private router:Router,
              private localStorageService:LocalStorageService,
              private usuarioService:UsuarioService,
              private prestadorService:PrestadorService,
              private dataSharing: DataSharingService,
              private contaService: ContaService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params:Params) => {
      this.idServico = parseInt(params.servicoAvaliado);
      this.idPrestador = parseInt(params.prestador);
      if(isNaN(this.idServico) || isNaN(this.idPrestador)) {
        this.router.navigate(['/']);
        return;
      }
      this.preencheServico(this.idServico, this.idPrestador);
    });
    this.dataSharing.isUsuarioLogado.subscribe(isLogado => {
      this.isLogado = isLogado;
      if(!this.isLogado) {
        return;
      }

      this.localStorageService.getItem(USER_TOKEN).subscribe((token:string) => {
        if(!token) {
          return;
        }
        this.contaService.getConta(token).subscribe(conta => {
          this.isCliente = conta.tipo === TipoPessoa.CLIENTE || conta.tipo == 1;
        }, err => {
          this.isLogado = false;
        });
      });
    });

    this.buscarAvaliacoesPorServicoDetalhado(this.idServico, this.paginaAtual, this.quantidadeItens);
  }

  parse(obj:any):any {
    return JSON.parse(obj);
  }

  preencheServico(idPrestador, idServico) {
    this.avaliacaoService.buscaServicoAvaliadoPorId(idPrestador, idServico).subscribe(servico => {
      if(!servico) {
        this.isNotFound = true;
        return;
      }

      let servicoDetalhado = this.parse(servico);
      console.log(servicoDetalhado);
      this.prestadorService.buscaPrestador(servicoDetalhado.prestador.id).subscribe(prestador => {
        servicoDetalhado.prestador = JSON.parse(prestador);
        this.servicoAvaliado = servicoDetalhado;
      });
      
    });
  }
  exibeForm() {
    this.isFormVisible = true;
  }

  getNomeServico() {
    return this.servicoAvaliado.tipo.nome;
  }

  getNomePrestador() {
    return this.servicoAvaliado.prestador.nome;
  }

  getAvaliacoes() {
    return this.avaliacoes;
  }

  possuiAvaliacoes() {
    return !!(this.getAvaliacoes()) && this.getAvaliacoes().length > 0;
  }

  getMediaAvaliacoes() {
    if(this.getAvaliacoes().length === 0) {
      return 0;
    }
    return (this.getAvaliacoes().reduce((total, avaliacao) => total += avaliacao.media, 0) / this.getAvaliacoes().length).toFixed(2);
  }

  adicionaAvaliacao(avaliacao:Avaliacao) {
    avaliacao.servicoAvaliado = this.servicoAvaliado;
    this.localStorageService.getItem(USER_TOKEN)
    .subscribe((token:string) => {
      this.usuarioService.getUsuario(token)
      .subscribe((cliente:Cliente) => {
        avaliacao.cliente = cliente;
        this.avaliacaoService.adicionarAvaliacao(avaliacao, this.idServico, this.idPrestador, token).subscribe(servico => {
          this.preencheServico(this.idServico, this.idPrestador);
          this.fechaFormulario();
          this.limpaAvaliacao();
          this.buscarAvaliacoesPorServicoDetalhado(this.idServico, this.paginaAtual, this.quantidadeItens)
        });
      });
    }); 
  }

  buscarAvaliacoesPorServicoDetalhado(idServico:number, pagina:number, quantidadeItens:number){
    this.avaliacaoService.buscarAvaliacoesPorServicoDetalhado(idServico, pagina, quantidadeItens)
      .subscribe(paginaAvaliacoes => {
        let objetoPaginado:ObjetoPaginado = JSON.parse(paginaAvaliacoes);
        let avaliacoesPaginada = objetoPaginado.content;

        this.avaliacoes = avaliacoesPaginada;

        this.quantidadeTotal = objetoPaginado.totalElements
        this.paginaAtual = objetoPaginado.pageable.pageNumber;
        this.quantidadeItens = objetoPaginado.size;
      });
  }

  eventoPagina(event: PageEvent){
    let pagina = event.pageIndex;
    let quantidadeItens = event.pageSize;
    
    this.buscarAvaliacoesPorServicoDetalhado(this.idServico, pagina, quantidadeItens);

    return event;
  }

  abreFormulario() {
    this.isFormVisible = true;
  }

  fechaFormulario() {
    this.limpaAvaliacao();
    this.isFormVisible = false;
  }

  limpaAvaliacao() {
    this.avaliacaoBase = {
      atencao:0,
      qualidadeProdutos:0,
      custoBeneficio:0,
      infraestrutura:0,
      qualidadeServico:0,
      comentario: null
    }
  }

}
