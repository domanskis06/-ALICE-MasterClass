import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-spinner-container',
    templateUrl: './spinner-container.component.html',
    styleUrls: ['./spinner-container.component.scss'],
    standalone: false
})
export class SpinnerContainerComponent implements OnInit {

  @Input()
  public diameter: number = 24;

  @Input()
  public loading: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
