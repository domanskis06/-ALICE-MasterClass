import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectSessionDialogComponent } from '../select-session-dialog/select-session-dialog.component';
import { ApiService, VisualAnalysisResultAPI } from '../shared/services/api.service';
import { StudentSelectedEvent } from './results/results.component';

export interface StudentResultAPI {
  student: number,
  dataset: number,
  k0: number[],
  lambda: number[],
  antilambda: number[],
  xi: number[]
}

export interface StudentResult {
  selected: boolean,
  student: number,
  dataset: number,
  k0: number[],
  lambda: number[],
  antilambda: number[],
  xi: number[]
}

@Component({
  selector: 'app-strangeness-visual-analysis',
  templateUrl: './strangeness-visual-analysis.component.html',
  styleUrls: ['./strangeness-visual-analysis.component.scss']
})
export class StrangenessVisualAnalysisComponent implements OnInit {

  public studentResults: StudentResult[] = [];

  public kaonMasses: number[] = [];
  public lambdaMasses: number[] = [];
  public antiLambdaMasses: number[] = [];
  public xiMasses: number[] = [];

  private sessionID: number = -1;

  constructor(private dialog: MatDialog, private apiService: ApiService) { }

  ngOnInit(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(SelectSessionDialogComponent, dialogConfig);

    dialogRef.componentInstance.proceedClickedEvent.subscribe((data: number) => {
      this.sessionID = data;
      this.reload();
      dialogRef.close();
    });
  }

  reload(): void {
    this.apiService.getStrangenessVisualAnalysisResults(this.sessionID).subscribe((data: VisualAnalysisResultAPI[]) => {
      const newData: StudentResult[] = [];
      for (let elm of data) {
        newData.push({
          selected: false,
          student: elm.student,
          dataset: elm.dataset,
          k0: elm.k0,
          lambda: elm.lambda,
          antilambda: elm.antilambda,
          xi: elm.xi
        });
      }
      this.studentResults = newData;

      this.updateHistogramData();
    });
  }

  onReload(): void {
    this.reload();
  }

  onStudentSelected(event: StudentSelectedEvent): void {
    for (let elm of this.studentResults) {
      if (elm.student === event.student) {
        elm.selected = event.selected;
      }
    }
    
    this.updateHistogramData();
  }

  onAllSelected(event: boolean): void {
    for (let elm of this.studentResults) {
      elm.selected = event;
    }
    
    this.updateHistogramData();
  }

  private updateHistogramData(): void {
    const kaonMasses = [];
    const lambdaMasses = [];
    const antiLambdaMasses = [];
    const xiMasses = [];

    for (let elm of this.studentResults) {
      if (elm.selected) {
        kaonMasses.push(...elm.k0);
        lambdaMasses.push(...elm.lambda);
        antiLambdaMasses.push(...elm.antilambda);
        xiMasses.push(...elm.xi);
      }
    }

    this.kaonMasses = kaonMasses;
    this.lambdaMasses = lambdaMasses;
    this.antiLambdaMasses = antiLambdaMasses;
    this.xiMasses = xiMasses;
  }

}
