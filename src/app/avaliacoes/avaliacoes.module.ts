import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvaliacaoComponent } from './avaliacao/avaliacao.component';
import { EstrelasComponent } from './estrelas/estrelas.component';
import { FormularioComponent } from './formulario/formulario.component';
import {MatIconModule} from '@angular/material/icon'; 
import {MatButtonModule} from '@angular/material/button'; 
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { NgxMaskModule } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ConfigModule } from '../config/config.module';

export function HttpLoaderFactory(http:HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  declarations: [
    AvaliacaoComponent, 
    EstrelasComponent, 
    FormularioComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
   ConfigModule
  ],
  exports: [
    AvaliacaoComponent, 
    EstrelasComponent, 
    FormularioComponent
  ]
})
export class AvaliacoesModule { }