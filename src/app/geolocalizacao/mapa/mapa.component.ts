import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import ol from 'openlayers';
import { FiltroServicos } from 'src/app/interfaces/filtro-servicos';
import { Geolocalizacao } from 'src/app/interfaces/geolocalizacao';
import { ServicoDetalhado } from 'src/app/interfaces/servico-detalhado';
import { DataSharingService } from 'src/app/servicos/data-sharing.service';
import { LocalStorageService } from 'src/app/servicos/local-storage.service';
import { ServicosService } from 'src/app/servicos/servicos.service';
import { UsuarioService } from 'src/app/servicos/usuario.service';
import { USER_TOKEN } from 'src/app/util/constantes';
import { DialogServicoSelecionadoComponent } from '../dialog-servico-selecionado/dialog-servico-selecionado.component';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
})
export class MapaComponent implements OnInit {
  @Input() isAtivo:boolean;

  @Input() isCliente:boolean;

  private PRACA_DA_REPUBLICA_LAT = '-23.543171200000003';

  private PRACA_DA_REPUBLICA_LON = '-46.64252052009493';

  filtro:FiltroServicos;

  servicos:ServicoDetalhado[];

  geolocalizacao:Geolocalizacao;

  source:ol.source.Vector;

  map:ol.Map;

  longitude:number;

  latitude: number;

  zoom: number;

  constructor(private localStorage:LocalStorageService,
    private usuarioService:UsuarioService,
    private dialog:MatDialog,
    private servicoService:ServicosService,
    private dataSharingService:DataSharingService) { }

  ngOnInit(): void {
    // this.preencheDadosGeoloc();
    this.dataSharingService.filtroShared.subscribe((filtro) => {
      this.filtro = filtro;
      this.preencheDadosGeoloc();
    });
  }

  preencheDadosGeoloc() {
    this.geolocalizacao = null;
    this.servicoService.buscarServicosGeoloc(this.filtro).subscribe((servicos) => {
      this.servicos = JSON.parse(servicos);
      this.localStorage.getItem(USER_TOKEN).subscribe((token:string) => {
        this.geolocalizacao = this.filtro.posicaoAtual;

        if (!token) {
          this.geraMapa(this.geolocalizacao, this.servicos);
          return;
        }

        this.usuarioService.getUsuario(token).subscribe((usuario) => {
          this.geraMapa(this.geolocalizacao, this.servicos, (usuario || {}).nome);
        });
      });
    });
  }

  geraMapa(geolocalizacao: Geolocalizacao, servicos:ServicoDetalhado[], name?:string) {
    this.latitude = Number.parseFloat((geolocalizacao || {}).geolocLatitude
    || this.PRACA_DA_REPUBLICA_LAT);
    this.longitude = Number.parseFloat((geolocalizacao || {}).geolocLongitude
    || this.PRACA_DA_REPUBLICA_LON);
    this.zoom = this.geolocalizacao ? 15 : 10;
    this.criaMapa([this.longitude, this.latitude], this.zoom, servicos, name);
  }

  /* eslint-disable func-names */
  criaMapa = (mapCenter:ol.Coordinate = [0, 0], mapZoom = 3, servicos = [], name?:string) => {
    document.getElementById('map').innerHTML = null;

    const cliente = this.criaPontoCliente(mapCenter, name);
    const pontosServicos = this.criaPontosServico(servicos);
    const source = new ol.source.Vector({
      features: [cliente, ...pontosServicos.filter(el => el !== null)],
    });

    const vectorLayer = new ol.layer.Vector({
      source,
    });

    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
        vectorLayer,
      ],
      view: new ol.View({
        center: ol.proj.transform(mapCenter, 'EPSG:4326', 'EPSG:3857'),
        zoom: mapZoom,
      }),
    });

    this.map.on('pointermove', function (evt:ol.MapBrowserEvent) {
      if (evt.dragging) return;

      const hit = this.forEachFeatureAtPixel(evt.pixel, (feature:any) => feature.get('name') === 'prestador');
      if (hit) {
        this.getTargetElement().style.cursor = 'pointer';
      } else {
        this.getTargetElement().style.cursor = '';
      }
    });

    this.map.on('click', function (evt:ol.MapBrowserEvent) {
      if (evt.dragging) return;

      const hit = this.forEachFeatureAtPixel(evt.pixel, (feature:any) => feature);

      if (hit) {
        hit.dispatchEvent('click');
      }
    });
  }

  /* eslint-disable func-names */
  criaPontosServico(servicos:ServicoDetalhado[]) {
    return servicos.map((servico) => {
      const { prestador } = servico;
      if(!prestador.geolocalizacao) {
        return null;
      }
      const posicao:ol.Coordinate = [
        Number.parseFloat(prestador.geolocalizacao.geolocLongitude),
        Number.parseFloat(prestador.geolocalizacao.geolocLatitude),
      ];
      const evento = () => {
        this.openDialog(servico);
      };

      return this.criaPonto('assets/icons/iconePrestador.png', posicao, 'prestador', prestador.nome, evento);
    });
  }

  private openDialog(servico:ServicoDetalhado) {
    this.dialog.open(DialogServicoSelecionadoComponent, {
      data: { servico, isAtivo: this.isAtivo, isCliente: this.isCliente },
      width: '1200px',
    });
  }

  criaPontoCliente(posicao?:ol.Coordinate, name?:string) {
    if (!posicao) {
      return null;
    }
    return this.criaPonto('assets/icons/iconeCliente.png', posicao, name, name);
  }

  criaPonto = (iconSrc:string, posicao:ol.Coordinate, name?:string, text?:string, event?:any) => {
    const ponto = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat(posicao)),
      name,
    });

    ponto.setStyle(new ol.style.Style({
      image: new ol.style.Icon({
        crossOrigin: 'anonimous',
        src: iconSrc,
        scale: 0.02,
      }),
      text: new ol.style.Text({
        text,
        fill: new ol.style.Fill({ color: '#69354a' }),
        offsetY: -12,
        stroke: new ol.style.Stroke({ color: '#000', width: 0.5 }),
        font: '18px',
      }),
    }));

    if (event) {
      ponto.on('click', event);
    }

    return ponto;
  }
}