export enum TrackType {
  STANDARD = 0,
  V0 = 1,
  CASCADE = 2,
  CASCADE_BACHELOR = 3
}

export interface Track {
  E: number;
  mass: number;
  particleId: number;
  comboId: number;
  sign: number;
  type: TrackType;
  px: number;
  py: number;
  pz: number;
  trajectory: number[][];
}

export interface Event {
  tracks: Track[];
  clusters: number[][];
  decays: Track[][];
}
