import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-instructions-dialog',
    templateUrl: './instructions-dialog.component.html',
    styleUrls: ['./instructions-dialog.component.scss'],
    standalone: false
})
export class InstructionsDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<InstructionsDialogComponent>) {
  }

  ngOnInit(): void {
  }

}
