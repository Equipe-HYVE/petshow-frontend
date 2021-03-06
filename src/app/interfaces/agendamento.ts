import { Endereco } from 'src/app/interfaces/endereco';
import { AnimalEstimacao } from 'src/app/interfaces/animalEstimacao';
import { ServicoDetalhado } from 'src/app/interfaces/servico-detalhado';
import { StatusAgendamento } from 'src/app/interfaces/statusAgendamento';
import { Prestador } from 'src/app/interfaces/prestador';
import { Usuario } from 'src/app/interfaces/usuario';
import { Avaliacao } from 'src/app/interfaces/avaliacao';
import { Adicional } from 'src/app/interfaces/adicional';
import { Negociacao } from 'src/app/interfaces/negociacao';

export interface Agendamento {
    id?:number;
    data?:string;
    comentario?:string;
    endereco?:Endereco;
    precoFinal?:number;
    statusId?:number;
    status?:StatusAgendamento;
    clienteId?:number;
    cliente?:Usuario;
    prestadorId?:number;
    prestador?:Prestador;
    servicoDetalhadoId?:number;
    servicoDetalhado?:ServicoDetalhado;
    avaliacao?:Avaliacao;
    animaisAtendidosIds?:number[];
    animaisAtendidos?:AnimalEstimacao[];
    adicionaisIds?:number[];
    adicionais?:Adicional[];
    negociacao?:Negociacao;
}
