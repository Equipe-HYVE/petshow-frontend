import { Component, OnInit } from '@angular/core';
import { PrestadorService } from '../servicos/prestador.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Prestador } from '../interfaces/prestador';
import { ServicoDetalhado } from '../interfaces/servico-detalhado';
import { Avaliacao } from '../interfaces/avaliacao';

@Component({
  selector: 'app-prestador',
  templateUrl: './prestador.component.html',
  styleUrls: ['./prestador.component.scss']
})
export class PrestadorComponent implements OnInit {
  prestador:Prestador;
  carregado:boolean = false;
  constructor(private route:ActivatedRoute,
    private router:Router,
    private prestadorService:PrestadorService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let idPrestador:number = +params.idPrestador;
      if(isNaN(idPrestador)) {
        this.router.navigate(['/']);
        return;
      }
      console.log(idPrestador)

      this.prestadorService.buscaPrestador(idPrestador).subscribe(prestador => {
        this.carregado = true;
        this.prestador = prestador;
      });
    })
  }

  getMediaAvaliacoes(servicoDetalhado:ServicoDetalhado) {
    if(!servicoDetalhado.avaliacoes || servicoDetalhado.avaliacoes.length === 0) {
      return 0;
    }

    let soma = servicoDetalhado.avaliacoes.reduce((soma:number, avaliacao:Avaliacao) => soma += avaliacao.media, 0);

    return soma / servicoDetalhado.avaliacoes.length;
  }

  getMediaUsuario() {
    if(this.prestador.servicos.length === 0) {
      return 0;
    }
    let somaMedias = this.prestador.servicos.reduce((soma:number, servico:ServicoDetalhado) => soma += this.getMediaAvaliacoes(servico), 0);

    return somaMedias / this.prestador.servicos.length
  }

}
