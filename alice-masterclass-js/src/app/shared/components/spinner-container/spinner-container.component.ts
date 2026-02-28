import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-spinner-container',
    templateUrl: './spinner-container.component.html',
    styleUrls: ['./spinner-container.component.scss'],
    standalone: false
})
export class SpinnerContainerComponent implements OnInit {

  @Input()
  diameter: number = 24;

  @Input()
  loading: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
