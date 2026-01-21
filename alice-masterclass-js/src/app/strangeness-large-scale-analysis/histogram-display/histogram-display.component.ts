import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FitService } from '../../shared/services/fit.service';

@Component({
    selector: 'app-histogram-display',
    templateUrl: './histogram-display.component.html',
    styleUrls: ['./histogram-display.component.scss'],
    standalone: false
})
export class HistogramDisplayComponent implements OnInit {

  @Input()
  loading: boolean = false;

  @Output()
  rangeChangeEvent: EventEmitter<[number, number]> = new EventEmitter<[number, number]>();

  constructor(public fitService: FitService) { }

  ngOnInit(): void {
    this.fitService.signalFunction =  (x: number) => 0;
    this.fitService.backgroundFunction = (x: number) => 0;
  }

  onZoom(event: [number, number]) {
    this.rangeChangeEvent.emit(event);
  }

}
