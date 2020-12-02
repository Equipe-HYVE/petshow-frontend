import { Cliente } from 'src/app/interfaces/cliente';
import { ServicoDetalhado } from 'src/app/interfaces/servico-detalhado';

export interface Avaliacao {
    id?:number,
    atencao:number,
    qualidadeProdutos:number,
    custoBeneficio:number,
    infraestrutura:number,
    qualidadeServico:number,
    comentario?:string,
    media?:number,
    cliente?:Cliente,
    clienteId?:number,
    servicoAvaliado?:ServicoDetalhado
    servicoAvaliadoId?:number

}
