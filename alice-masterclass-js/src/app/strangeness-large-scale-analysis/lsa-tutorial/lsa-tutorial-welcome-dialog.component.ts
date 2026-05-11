import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-lsa-tutorial-welcome-dialog',
  templateUrl: './lsa-tutorial-welcome-dialog.component.html',
  styleUrls: ['./lsa-tutorial-welcome-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class LsaTutorialWelcomeDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<LsaTutorialWelcomeDialogComponent, boolean>,
  ) {}

  skip(): void {
    this.dialogRef.close(false);
  }

  start(): void {
    this.dialogRef.close(true);
  }
}
