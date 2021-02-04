import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalStorageService } from 'src/app/servicos/local-storage.service';
import { USER_TOKEN } from 'src/app/util/constantes';
import { ServicosService } from 'src/app/servicos/servicos.service';
import { ServicoDetalhado } from 'src/app/interfaces/servico-detalhado';
import { PageEvent } from '@angular/material/paginator';
import { AnimalEstimacao } from 'src/app/interfaces/animalEstimacao';
import { ServicoDetalhadoTipoAnimal } from 'src/app/interfaces/servico-detalhado-tipo-animal';
import { Adicional } from 'src/app/interfaces/adicional';


import {FormControl} from '@angular/forms';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';


const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-servico-detalhado',
  templateUrl: './servico-detalhado.component.html',
  styleUrls: ['./servico-detalhado.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    // {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})
export class ServicoDetalhadoComponent implements OnInit {
  @Input() isVisualizacao: Boolean;
  @Input() idServico: number;
  @Input() idPrestador: number;
  @Input('animais') animaisSelecionados:AnimalEstimacao[] = [];
  @Output('retorna-tipos') retornaTipos = new EventEmitter<ServicoDetalhadoTipoAnimal[]>();
  @Output('retorna-adicionais') retornaAdicionais = new EventEmitter<Adicional[]>();
  @Output('recupera-data') recuperaData = new EventEmitter<Date>();

  servicoDetalhado: ServicoDetalhado;
  pageEvent: PageEvent;
  quantidadeTotal:number;
  quantidadeItens:number = 5;
  paginaAtual:number = 0;
  precoPorTipo:ServicoDetalhadoTipoAnimal[] = [];
  adicionais:Adicional[] = [];
  dataAgendamento:Date;
  dataMinima:Date;
  date = new FormControl(moment());

  constructor(private _adapter: DateAdapter<any>,
    private localStorageService: LocalStorageService,
    private servicosService: ServicosService) { }

    english() {
      this._adapter.setLocale('en');
    }
    portuguese() {
      this._adapter.setLocale('pt');
    }

  ngOnInit(): void {
    this.dataMinima = new Date();
    this.buscarPorPrestadorIdEServicoId(this.idPrestador, this.idServico);
  }

  buscarPorPrestadorIdEServicoId(prestadorId:number, servicoDetalhadoId:number) {
    this.localStorageService.getItem(USER_TOKEN).subscribe((token : string) => {
      this.servicosService.buscarPorPrestadorIdEServicoId(prestadorId, servicoDetalhadoId, token)
        .subscribe((servicoDetalhado) => {
          this.servicoDetalhado = servicoDetalhado;
        });
    });
  }

  getInformacoesTipoServico() {
    const {precoPorTipo} = this.servicoDetalhado;
    this.precoPorTipo = (this.animaisSelecionados || [])
    .map(animal => animal.tipo)
    .map(tipoAnimal => precoPorTipo.find(tipo => tipo.tipoAnimal.id === tipoAnimal.id));
    
    this.retornaTipos.emit(this.precoPorTipo);
    return this.precoPorTipo;
  }

  selecionaTipo(selecionados) {
    this.precoPorTipo = selecionados.map(el => el.value);
    this.retornaTipos.emit(this.precoPorTipo);
  }

  getDescricaoServico(preco:ServicoDetalhadoTipoAnimal):string {
    if(!preco.tipoAnimal.porte && !preco.tipoAnimal.pelagem) {
      return '';
    }

    return `(${preco.tipoAnimal.porte ? `Porte: ${preco.tipoAnimal.porte}` : ''} | ${preco.tipoAnimal.pelagem ? `Pelagem: ${preco.tipoAnimal.pelagem}` : ''})`;
  }

  selecionaAdicional(selecionados) {
    this.adicionais = selecionados.map(el => el.value);
    this.retornaAdicionais.emit(this.adicionais);
  }

  selecionaData(data) {
    this.dataAgendamento = data.value;
    this.recuperaData.emit(this.dataAgendamento);
  }
}
