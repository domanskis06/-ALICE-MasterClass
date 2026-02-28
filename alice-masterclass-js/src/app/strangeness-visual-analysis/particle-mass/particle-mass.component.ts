import { Component, OnInit } from '@angular/core';

export interface Particle {
  type: string;
  mass: number;
}

@Component({
    selector: 'app-particle-mass',
    templateUrl: './particle-mass.component.html',
    styleUrls: ['./particle-mass.component.scss'],
    standalone: false
})
export class ParticleMassComponent implements OnInit {

  readonly displayedColumns: string[] = ['type', 'mass'];

  readonly dataSource: Particle[] = [
    {type: 'e<sup>−</sup>, e<sup>+</sup>', mass: 0.0005},
    {type: 'π<sup>−</sup>, π<sup>+</sup>', mass: 0.1396},
    {type: 'K<span class="supsub"><sup>0</sup><sub>S</sub></span>', mass: 0.4976},
    {type: 'p, p&#773;', mass: 0.9383},
    {type: 'Λ, Λ&#773;', mass: 1.1157},
    {type: 'Ξ, Ξ&#773;', mass: 1.3217},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
