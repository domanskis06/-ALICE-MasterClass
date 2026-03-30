import { Component, OnInit, Type } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InstructionsProvider } from '../shared/interfaces';
import { BreakpointObserver } from '@angular/cdk/layout';
import { forkJoin, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SelectDatasetDialogComponent } from '../select-dataset-dialog/select-dataset-dialog.component';
import { Event, Track, TrackType } from '../shared/models';

import { StrangenessDataService } from '../services/strangeness-data.service';
import { ParticleType, VisualAnalysisResultsEntry } from '../shared/services/api.service';
import { InstructionsComponent } from './instructions/instructions.component';
import { TranslateService } from '@ngx-translate/core';

export interface SubmitHistogramEntry {
  type: ParticleType,
  mass: number
}

@Component({
    selector: 'app-strangeness-visual-analysis',
    templateUrl: './strangeness-visual-analysis.component.html',
    styleUrls: ['./strangeness-visual-analysis.component.scss'],
    standalone: false
})
export class StrangenessVisualAnalysisComponent implements OnInit, InstructionsProvider {

  instructionsComponent: Type<any> = InstructionsComponent;

  readonly ALICE_DETECTOR_MODEL = "assets/models/alice.glb";
  readonly ALICE_DETECTOR_RPHI = "assets/models/alice_rphi.svg";
  readonly ALICE_DETECTOR_RHOZ = "assets/models/alice_rhoz.svg";

  datasetID: number = SelectDatasetDialogComponent.DEMO;
  eventID: number = 0;
  maxEvents: number = 0;
  event: Event = {tracks: [], decays: [], clusters: []};

  particlePos: Track = null;
  particleNeg: Track = null;
  particleBac: Track = null;

  uploadDisabledDatasets: Array<Number> = [SelectDatasetDialogComponent.DEMO];
  
  isLandscape$: Observable<boolean>;

  get isCurrentEventDone(): boolean {
    return this.dataService.visualAnalysisResults.has(String(this.eventID));
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar,
    public dataService: StrangenessDataService,
    private translateService: TranslateService
    ) { 
      this.isLandscape$ = this.breakpointObserver.observe('(orientation: landscape)')
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
    }

  ngOnInit(): void {
    this.maxEvents = this.dataService.EVENTS_IN_DEMO_DATASET;
    this.loadEvent().subscribe(
      (data: Event) => {
        this.eventChanged();
        this.event = data;
      },
      (error: HttpErrorResponse) => {
      }
    );
  }

  private loadEvent() {
    let datasetNum;

    if (this.datasetID === SelectDatasetDialogComponent.DEMO) {
      datasetNum = this.dataService.DEMO_DATASET_ID;
    } else if (this.datasetID === SelectDatasetDialogComponent.FULL_EVENT) {
      datasetNum = this.dataService.FULL_DATASET_ID;
    } else {
      datasetNum = this.datasetID;
    }

    return this.dataService.getEvent(datasetNum, this.eventID);
  }

  onDatasetChange(newDatasetID: number): void {
    this.dataService.clearVisualAnalysisResults();
    this.datasetID = newDatasetID;

    if (this.datasetID === SelectDatasetDialogComponent.DEMO) {
      this.maxEvents = this.dataService.EVENTS_IN_DEMO_DATASET;
    } else if (this.datasetID === SelectDatasetDialogComponent.FULL_EVENT) {
      this.maxEvents = this.dataService.EVENTS_IN_FULL_DATASET;
    } else {
      this.maxEvents = this.dataService.EVENTS_IN_DATASET;
    }

    this.eventID = 0;
    this.loadEvent().subscribe(
      (data: Event) => {
        this.eventChanged();
        this.event = data;
      },
      (error: HttpErrorResponse) => {
      }
    );
  }

  onPreviousEvent(): void {
    this.eventID -= 1;

    this.loadEvent().subscribe(
      (data: Event) => {
        this.eventChanged();
        this.event = data;
      },
      (error: HttpErrorResponse) => {
      }
    );
  }

  onNextEvent(): void {
    this.eventID += 1;
    
    this.loadEvent().subscribe(
      (data: Event) => {
        this.eventChanged();
        this.event = data;
      },
      (error: HttpErrorResponse) => {
      }
    );
  }

  private eventChanged(): void {
    this.event = null;
    this.particlePos = null;
    this.particleNeg = null;
    this.particleBac = null;
  }

  onTrackClicked(event: Track): void {
    if (event.type == TrackType.CASCADE_BACHELOR) {
      this.particleBac = event;
    } else if (event.sign > 0) {
      this.particlePos = event;
    } else if (event.sign < 0) {
      this.particleNeg = event;
    }
  }

  onAddToHistogram(event: SubmitHistogramEntry) {
    const value: VisualAnalysisResultsEntry = {particle: event.type, mass: event.mass};

    this.dataService.addVisualAnalysisResult(String(this.eventID), value);
  }

  onUploadResults() {
    let uploadingTranslation = '', completedTranslation = '';

    forkJoin([ this.translateService.get('PASSWORD.UPLOADING'), this.translateService.get('PASSWORD.COMPLETED') ])
      .subscribe((res) => {
        uploadingTranslation = res[0];
        completedTranslation = res[1];

        this.snackBar.open(uploadingTranslation, null, {duration: this.dataService.DATA_UPLOAD_COMPLETED_DURATION});

        this.dataService.submitVisualAnalysisResults(this.datasetID).subscribe(() => {
          this.snackBar.open(completedTranslation, null, {duration: this.dataService.DATA_UPLOAD_COMPLETED_DURATION});
        });
    });
  }
}
