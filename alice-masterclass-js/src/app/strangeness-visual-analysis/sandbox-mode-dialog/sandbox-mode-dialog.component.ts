import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Options } from '@angular-slider/ngx-slider';

import { Event, Track } from '../../shared/models';

export interface SandboxModeDialogData {
  event: Event;
  detectorModel: string;
  detectorRphi: string;
  detectorRhoz: string;
  onTrackClicked?: (track: Track) => void;
}

interface SandboxAsset {
  id: string;
  label: string;
  icon: string;
}

interface PlacedAsset {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-sandbox-mode-dialog',
  templateUrl: './sandbox-mode-dialog.component.html',
  styleUrls: ['./sandbox-mode-dialog.component.scss'],
  standalone: false
})
export class SandboxModeDialogComponent {
  readonly BLACK_BACKGROUND: number = 0x000000;
  magneticFieldT: number = 0.5;
  magneticFieldOptions: Options = {
    floor: 0,
    ceil: 10,
    step: 0.1,
    showTicks: false,
    showSelectionBar: true
  };
  detectorModelOptions: Array<{ label: string; value: string }> = [];
  selectedDetectorModel: string;
  sandboxAssets: SandboxAsset[] = [
    { id: 'magnet', label: 'Small Magnet', icon: '🧲' },
    { id: 'human', label: 'Human', icon: '🧍' },
    { id: 'apple', label: 'Apple', icon: '🍎' }
  ];
  placedAssets: PlacedAsset[] = [];

  constructor(
    public dialogRef: MatDialogRef<SandboxModeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SandboxModeDialogData
  ) {
    this.detectorModelOptions = [
      { label: 'ALICE Standard', value: data.detectorModel },
      { label: 'ALICE Analysis', value: data.detectorModel },
      { label: 'ALICE Sandbox', value: data.detectorModel }
    ];
    this.selectedDetectorModel = data.detectorModel;
  }

  get hasClusters(): boolean {
    return (this.data?.event?.clusters?.length ?? 0) !== 0;
  }

  onTrackClicked(track: Track): void {
    this.data.onTrackClicked?.(track);
  }

  close(): void {
    this.dialogRef.close();
  }

  onAssetDragStart(event: DragEvent, asset: SandboxAsset): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData('text/plain', asset.id);
    event.dataTransfer.effectAllowed = 'copy';
  }

  onDetectorDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  onDetectorDrop(event: DragEvent): void {
    event.preventDefault();
    const assetId = event.dataTransfer?.getData('text/plain');
    if (!assetId) return;
    const asset = this.sandboxAssets.find((a) => a.id === assetId);
    if (!asset) return;

    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 64, event.clientX - rect.left - 20));
    const y = Math.max(0, Math.min(rect.height - 32, event.clientY - rect.top - 16));

    this.placedAssets.push({
      id: asset.id,
      label: asset.label,
      icon: asset.icon,
      x,
      y
    });
  }
}

