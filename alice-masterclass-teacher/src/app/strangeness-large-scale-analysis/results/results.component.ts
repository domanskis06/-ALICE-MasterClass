import { Component, OnInit, Input, HostBinding, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StrangenessEnhancementEntry, KAON_COLOR, LAMBDA_COLOR, ANTILAMBDA_COLOR } from '../strangeness-large-scale-analysis.component';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss'],
    standalone: false
})
export class ResultsComponent implements OnInit {
  @Input()
  @HostBinding("style.--kaon-color")
  public kaonColor: string = KAON_COLOR;

  @Input()
  @HostBinding("style.--lambda-color")
  public lambdaColor: string = LAMBDA_COLOR;

  @Input()
  @HostBinding("style.--antilambda-color")
  public antilambdaColor: string = ANTILAMBDA_COLOR;

  @Input()
  get resultsData(): StrangenessEnhancementEntry[] { return this._results; }
  set resultsData(results: StrangenessEnhancementEntry[]) {
    this._results = results;

    this.tableRows.data = this._results;
  }
  private _results: StrangenessEnhancementEntry[] = [];

  @Output()
  reloadClickedEvent = new EventEmitter<any>();

  public readonly displayedColumns: string[] = [
    'centrality', 'nParticipants', 'nEvents',
    'nKaons', 'effKaons', 'yieldKaons', 'enhKaons',
    'nLambdas', 'effLambdas', 'yieldLambdas', 'enhLambdas',
    'nAntiLambdas', 'effAntiLambdas', 'yieldAntiLambdas', 'enhAntiLambdas'
  ];

  public tableRows: MatTableDataSource<StrangenessEnhancementEntry> = new MatTableDataSource<StrangenessEnhancementEntry>();

  constructor() { }

  ngOnInit(): void {
  }

  reloadButtonClicked(): void {
    this.reloadClickedEvent.emit();
  }
}
