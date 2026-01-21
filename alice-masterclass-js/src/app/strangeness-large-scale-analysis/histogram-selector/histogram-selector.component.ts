import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { OpenHistogramEntry } from '../strangeness-large-scale-analysis.component';
import { CollisionCentralityEntry } from '../../services/strangeness-data.service';

@Component({
    selector: 'app-histogram-selector',
    templateUrl: './histogram-selector.component.html',
    styleUrls: ['./histogram-selector.component.scss'],
    standalone: false
})
export class HistogramSelectorComponent implements OnInit {

  @Input()
  get datasets(): Map<string, Array<CollisionCentralityEntry>> { return this._datasets; }
  set datasets(datasets: Map<string, Array<CollisionCentralityEntry>>) {
    this._datasets = datasets;
    this.particileTypes = Array.from(this.datasets.keys());
    this.collisionCentralityOptions = [];
  }
  private _datasets: Map<string, Array<CollisionCentralityEntry>> = new Map<string, Array<CollisionCentralityEntry>>();

  @Output()
  openHistogramEvent: EventEmitter<OpenHistogramEntry> = new EventEmitter<OpenHistogramEntry>();

  particileTypes: Array<string> = [];
  collisionCentralityOptions: Array<CollisionCentralityEntry> = [];

  histogramSelectorForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.histogramSelectorForm = this.formBuilder.group({
      type: ['', Validators.required],
      collisionCentrality: ['', Validators.required]
    });

    this.histogramSelectorForm.controls.type.valueChanges.subscribe((value: string) => this.onTypeChanges(value));
   }

  ngOnInit(): void {
  }

  onTypeChanges(value: string): void {
    this.collisionCentralityOptions = this.datasets.get(value);
  }

  onSubmit(): void {
    const type = this.histogramSelectorForm.controls.type.value;
    const chosenOption = this.collisionCentralityOptions[this.histogramSelectorForm.controls.collisionCentrality.value];
    const centrality = chosenOption.centrality;
    const collision = chosenOption.collision;

    this.openHistogramEvent.emit({particle: type, centrality: centrality, collision: collision});
  }

}
