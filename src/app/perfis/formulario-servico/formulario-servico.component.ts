import {
  Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewContainerRef,
} from '@angular/core';
import { ServicoDetalhado } from 'src/app/interfaces/servico-detalhado';
import { BANHO } from 'src/app/util/tipo-servico';
import { MyErrorStateMatcher } from 'src/app/classes/my-error-state-matcher';
import { ServicosService } from 'src/app/servicos/servicos.service';
import { FormControl, Validators } from '@angular/forms';
import { Servico } from 'src/app/interfaces/servico';
import { DynamicContentInjectorService } from 'src/app/servicos/dynamic-content-injector.service';
import { Adicional } from 'src/app/interfaces/adicional';

@Component({
  selector: 'app-formulario-servico',
  templateUrl: './formulario-servico.component.html',
  styleUrls: ['./formulario-servico.component.scss'],
})
export class FormularioServicoComponent implements OnInit {
  @ViewChild('adicionais', {
    read: ViewContainerRef,
  }) viewContainerRef: ViewContainerRef;

  @Input() servico: ServicoDetalhado = {
    precoPorTipo:[],
    tipo: null,
    adicionais: [],
  };

  servicos:Servico[];

  public precosPorTipo:[];

  gato_checked:Boolean;

  cachorro_checked:Boolean;


  @Output('adiciona-servico') adicionaServico = new EventEmitter<ServicoDetalhado>();

  @Output('cancelar-operacao') cancelaOperacao = new EventEmitter<any>();

  @Input() exibeFormulario:Boolean;

  matcher = new MyErrorStateMatcher();

  precoFormControl = new FormControl('', [
    Validators.required,
  ]);

  descricaoFormControl = new FormControl('', [
    Validators.required,
  ]);

  constructor(private servicoService:ServicosService,
              private dynamicLoader:DynamicContentInjectorService) {}

  hasErrors() {
    return this.precoFormControl.hasError('required') || this.descricaoFormControl.hasError('minLength');
  }

  getTipoServico() {
    return (this.servico.tipo || BANHO).id;
  }

  insereServico() {
    this.adicionaServico.emit(this.trataServico(this.servico));
    this.viewContainerRef.clear();
  }

  private trataServico = (servico:ServicoDetalhado): ServicoDetalhado => {
    const adicionais = [...(servico.adicionais || []).filter((adicional) => adicional.nome !== null && adicional.nome !== '')];
    return { ...servico, adicionais };
  }

  cancelarOperacao() {
    this.viewContainerRef.clear();
    this.cancelaOperacao.emit();
  }

  getTiposServico() {
    return this.servicos;
  }

  ngOnInit(): void {
    this.servicoService.getTipos().subscribe((servicos) => {
      this.servicos = JSON.parse(servicos);
    },
    () => {
      this.servicos = [];
    });
  }

  toggleCheckBoxGato() {
    this.gato_checked= !this.gato_checked;
  }

  toggleCheckBoxCachorro() {
    this.cachorro_checked= !this.cachorro_checked;
  }  

  ngAfterViewInit() {
    this.dynamicLoader.setViewContainerRef(this.viewContainerRef);
  }

  addAdicionalComponent() {
    const adicional = this.dynamicLoader.addDynamicComponent(({
      id: null, preco: 0.0, descricao: '', nome: '',
    }) as Adicional);
    this.servico.adicionais = [...(this.servico.adicionais || []), adicional];
  }
}
