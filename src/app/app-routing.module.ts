import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from 'src/app/home/home.component';
import { LoginComponent } from 'src/app/acesso/login/login.component';
import { CadastroComponent } from 'src/app/acesso/cadastro/cadastro.component';
import { AvaliacaoComponent } from 'src/app/avaliacoes/avaliacao/avaliacao.component'
import { ListaServicosDetalhadosComponent } from 'src/app/lista-servicos-detalhados/lista-servicos-detalhados.component';
import { PerfilComponent } from 'src/app/perfis/perfil/perfil.component';
import { PrestadorComponent } from 'src/app/prestador/prestador.component';
import { SucessoCadastroComponent } from './acesso/sucesso-cadastro/sucesso-cadastro.component';
import { TokenAtivacaoComponent } from './acesso/token-ativacao/token-ativacao.component';

const routes: Routes = [
  {path: 'perfil', component: PerfilComponent},
  {path: 'login', component: LoginComponent},
  {path: 'cadastro', component: CadastroComponent},
  {path: '', component: HomeComponent},
  {path: 'avaliacao', component: AvaliacaoComponent},
  {path: 'servico-detalhado/tipo-servico/:id', component: ListaServicosDetalhadosComponent},
  {path: 'prestador', component: PrestadorComponent},
  {path: 'cadastro-sucesso', component: SucessoCadastroComponent},
  {path: 'dido será confirmado em até 1 dia útil após o pagamento do Boleto. Se o Boleto não for pago até a data de vencimento, o pedido será cancelado.', component: TokenAtivacaoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule { }