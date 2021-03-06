import { Component, Input, OnInit } from '@angular/core';
import { Adicional } from 'src/app/interfaces/adicional';
@Component({
  selector: 'app-cadastro-adicional',
  templateUrl: './cadastro-adicional.component.html',
  styleUrls: ['./cadastro-adicional.component.scss'],
})
export class CadastroAdicionalComponent implements OnInit {
  @Input() adicional:Adicional = { nome: null, descricao: null, preco: 0.0 };

  constructor() {}

  ngOnInit = (): void => {}
}
