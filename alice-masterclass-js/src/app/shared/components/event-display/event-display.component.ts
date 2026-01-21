import { Component, ElementRef, Input, Output, AfterViewInit, ViewChild, EventEmitter, HostBinding, OnDestroy } from '@angular/core';
import { Observable, Subscription, animationFrameScheduler, scheduled } from 'rxjs';
import { repeat, map, shareReplay } from 'rxjs/operators'; // Dodano brakujące operatory
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader';
import { Event, Track, TrackType } from '../../models';
import { trackColor, clusterColor, positiveTrackColor, negativeTrackColor, bachelorTrackColor, highlightColor } from '../../globals';

@Component({
    selector: 'app-event-display',
    templateUrl: './event-display.component.html',
    styleUrls: ['./event-display.component.scss'],
    standalone: false
})
export class EventDisplayComponent implements AfterViewInit, OnDestroy {
  private readonly TRACKS_USE_GL_LINES: boolean = false;
  private readonly CLUSTERS_USE_POINTS: boolean = true;
  private readonly CLUSTER_TEXTURE: string = 'assets/models/cluster.png';
  private readonly CLICK_HIGHLIGHT_DURATION = 200;

  @HostBinding("style.--primary-axis-ratio")
  readonly PRIMARY_AXIS_RATIO: number = 1 / 1.61803398875;
  @HostBinding("style.--secondary-axis-ratio")
  readonly SECONDARY_AXIS_RATIO: number = 1 / 2;

  static readonly fieldOfView: number = 70;
  static readonly nearClippingPlane: number = 0.01;
  static readonly farClippingPlane: number = 8000;
  static readonly objectScale: number = 1.0e-2;
  static readonly lineSegments: number = 50;

  static readonly trackColor = new THREE.Color(trackColor);
  static readonly clusterColor = new THREE.Color(clusterColor);
  static readonly positiveTrackColor = new THREE.Color(positiveTrackColor);
  static readonly negativeTrackColor = new THREE.Color(negativeTrackColor);
  static readonly bachelorTrackColor = new THREE.Color(bachelorTrackColor);
  static readonly highlightColor = new THREE.Color(highlightColor);

  private trackMaterial: THREE.Material;
  private postiveTrackMaterial: THREE.Material;
  private negativeTrackMaterial: THREE.Material;
  private bachelorTrackMaterial: THREE.Material;
  private highlightTrackMaterial: THREE.Material;
  private pointsMaterial: THREE.Material;

  @Input()
  get trackWidth(): number { return this._trackWidth; }
  get trackHighlightWidth(): number { return 2 * this.trackWidth };
  get trackDecayWidth(): number { return 1.2 * this.trackWidth };

  set trackWidth(value: number) {
    this._trackWidth = value;
    // Rzutowanie na LineMaterial, aby uzyskać dostęp do pola linewidth
    if (this.trackMaterial instanceof LineMaterial) {
      (this.trackMaterial as LineMaterial).linewidth = this.trackWidth;
      (this.postiveTrackMaterial as LineMaterial).linewidth = this.trackDecayWidth;
      (this.negativeTrackMaterial as LineMaterial).linewidth = this.trackDecayWidth;
      (this.bachelorTrackMaterial as LineMaterial).linewidth = this.trackDecayWidth;
      (this.highlightTrackMaterial as LineMaterial).linewidth = this.trackHighlightWidth;
    }
  }
  private _trackWidth: number = 1;

  @Input()
  get clusterSize(): number { return this._clusterSize; }
  set clusterSize(value: number) {
    this._clusterSize = value;
    if (this.CLUSTERS_USE_POINTS && this.pointsMaterial instanceof THREE.PointsMaterial) {
      (this.pointsMaterial as THREE.PointsMaterial).size = this._clusterSize;
    } else {
      this.setSizeRecursive(this.clusters, this._clusterSize);
    }
  }
  private _clusterSize: number = 0.1;

  private setSizeRecursive(object: THREE.Object3D, value: number) {
    object.traverse((o: any) => {
      if (o.isMesh) {
        o.scale.set(value, value, value);
      }
    });
  }

  loading: boolean = false;
  private trackHoverObj: any = null;
  private trackHoverOrigMaterial: THREE.Material = null;

  private scene = new THREE.Scene();
  private axes = new THREE.Group();
  private lights = new THREE.Group();
  private camera3D!: THREE.PerspectiveCamera;
  private cam3DVP = new THREE.Vector4();
  private cameraRphi!: THREE.PerspectiveCamera;
  private camRphiVP = new THREE.Vector4();
  private cameraRhoz!: THREE.PerspectiveCamera;
  private camRhozVP = new THREE.Vector4();
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  private tracks = new THREE.Object3D();
  private decays = new THREE.Object3D();
  private clusters = new THREE.Object3D();

  private loaderGLTF = new GLTFLoader();
  private loaderSVG = new SVGLoader();
  private detector = new THREE.Group();
  private detectorScene: THREE.Group | null = null;
  private detectorSideViews = new THREE.Group();
  private detectorSideViewsRphi = new THREE.Group();
  private detectorSideViewsRhoz = new THREE.Group();

  @Input()
  get landscape(): boolean { return this._landscape; }
  set landscape(value: boolean) {
    this._landscape = value;
    this.resize(true);
  }
  private _landscape: boolean = true;

  @ViewChild('canvas') canvasRef!: ElementRef;
  private get canvas(): HTMLCanvasElement { return this.canvasRef.nativeElement; }
  private get aspectRatio(): number { return this.canvas.clientWidth / this.canvas.clientHeight; }

  @Input()
  set detectorModel(value: string) {
    this._detectorModel = value;
    this.detector.clear();
    this.loading = true;
    this.loaderGLTF.load(value, (gltf: GLTF) => {
      this.detectorScene = gltf.scene;
      this.setOpacityRecursive(this.detectorScene, 0.3);
      this.detector.add(this.detectorScene);
      this.loading = false;
    });
  }
  private _detectorModel!: string;

  private setOpacityRecursive(object: THREE.Object3D, value: number) {
    object.traverse((o: any) => {
      if (o.isMesh) {
        o.material.transparent = true;
        o.material.opacity = value;
        o.material.side = THREE.DoubleSide;
      }
    });
  }

  // --- SVG Loader Fix (ShapeBufferGeometry -> ShapeGeometry) ---
  private addSVGToScene(data: SVGResult, finalize: any) {
    const paths = data.paths;
    const group = new THREE.Group();
    for (let path of paths) {
      const fillColor = path.userData?.style.fill;
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setStyle(fillColor),
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const shapes = path.toShapes(true);
      for (let shape of shapes) {
        // Zmiana na ShapeGeometry
        const geometry = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      }
    }
    finalize(group);
  }

  @Input() set sideViewsShown(value: boolean) { this._sideViewsShown = value; this.resize(true); }
  get sideViewsShown(): boolean { return this._sideViewsShown; }
  private _sideViewsShown: boolean = false;

  @Input() set axesShown(value: boolean) { this.axes.visible = value; }
  @Input() set detectorShown(value: boolean) { this.detector.visible = value; this.detectorSideViews.visible = value; }
  @Input() set tracksShown(value: boolean) { this.tracks.visible = value; }
  @Input() hasClusters: boolean = false;
  @Input() set clustersShown(value: boolean) { this.clusters.visible = value; }
  @Input() set decaysShown(value: boolean) { this.decays.visible = value; }

  private createLine(track: number[][], material: THREE.Material): THREE.Object3D {
    const points: THREE.Vector3[] = track.map(p => 
      new THREE.Vector3(p[0] * EventDisplayComponent.objectScale, p[1] * EventDisplayComponent.objectScale, p[2] * EventDisplayComponent.objectScale)
    );

    const spline = new THREE.CatmullRomCurve3(points);
    const vertices = spline.getPoints(EventDisplayComponent.lineSegments);
    
    if (this.TRACKS_USE_GL_LINES) {
      const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
      return new THREE.Line(geometry, material);
    } else {
      const points2: number[] = [];
      vertices.forEach(v => points2.push(v.x, v.y, v.z));
      const lineGeometry = new LineGeometry();
      lineGeometry.setPositions(points2);
      const mesh = new Line2(lineGeometry, material as LineMaterial);
      mesh.computeLineDistances();
      return mesh;
    }
  }

  @Input() set event(event: Event) {
    this._event = event;
    this.tracks.clear();
    this.decays.clear();
    this.clusters.clear();
    if (!event) return;

    event.tracks.forEach(t => this.tracks.add(this.createLine(t.trajectory, this.trackMaterial)));

    for (let particleList of event.decays) {
      const decayObject = new THREE.Object3D();
      particleList.forEach(track => {
        let mat = this.trackMaterial;
        if (track.type === TrackType.CASCADE_BACHELOR) mat = this.bachelorTrackMaterial;
        else if (track.sign < 0) mat = this.negativeTrackMaterial;
        else if (track.sign > 0) mat = this.postiveTrackMaterial;
        
        const line = this.createLine(track.trajectory, mat);
        line.userData = track;
        decayObject.add(line);
      });
      this.decays.add(decayObject);
      break;
    }

    if (event.clusters) {
      const clusterPoints = event.clusters.map(p => 
        new THREE.Vector3(p[0] * EventDisplayComponent.objectScale, p[1] * EventDisplayComponent.objectScale, p[2] * EventDisplayComponent.objectScale)
      );
      if (this.CLUSTERS_USE_POINTS) {
        const geo = new THREE.BufferGeometry().setFromPoints(clusterPoints);
        const pMesh = new THREE.Points(geo, this.pointsMaterial);
        pMesh.renderOrder = 999;
        this.clusters.add(pMesh);
      }
    }
  }
  private _event: Event | null = null;

  @Output() trackClickedEvent = new EventEmitter<Track>();
  @Output() previousEvent = new EventEmitter();
  @Output() nextEvent = new EventEmitter();

  private rendernig: Observable<number> = scheduled([0], animationFrameScheduler).pipe(repeat());
  private renderingSubscription: Subscription | null = null;

  constructor() {
    const lineParams = { linewidth: this.trackWidth, resolution: new THREE.Vector2(1, 1) };
    this.trackMaterial = new LineMaterial({ color: EventDisplayComponent.trackColor, ...lineParams });
    this.postiveTrackMaterial = new LineMaterial({ color: EventDisplayComponent.positiveTrackColor, ...lineParams });
    this.negativeTrackMaterial = new LineMaterial({ color: EventDisplayComponent.negativeTrackColor, ...lineParams });
    this.bachelorTrackMaterial = new LineMaterial({ color: EventDisplayComponent.bachelorTrackColor, ...lineParams });
    this.highlightTrackMaterial = new LineMaterial({ color: EventDisplayComponent.highlightColor, ...lineParams });

    this.pointsMaterial = new THREE.PointsMaterial({
      color: EventDisplayComponent.clusterColor,
      size: this.clusterSize,
      transparent: true,
      alphaTest: 0.5
    });
  }

  // --- Rendering & Resizing Logic (Fixing Resolution errors) ---
  private render(): void {
    this.resize(false);
    this.controls.update();
    const zoomz = this.controls.target.distanceTo(this.controls.object.position);
    this.cameraRphi.zoom = this.cameraRhoz.zoom = 10 / zoomz;

    const materials = [this.trackMaterial, this.postiveTrackMaterial, this.negativeTrackMaterial, this.bachelorTrackMaterial, this.highlightTrackMaterial];

    this.renderer.setScissorTest(this.sideViewsShown);
    const oldVP = new THREE.Vector4();
    this.renderer.getViewport(oldVP);

    if (this.sideViewsShown) {
      // Wyliczanie widoków R-Phi i Rho-Z...
      this.renderer.setViewport(this.camRphiVP);
      this.renderer.setScissor(this.camRphiVP);
      materials.forEach(m => (m as any).resolution?.set(this.camRphiVP.z, this.camRphiVP.w));
      this.renderer.render(this.scene, this.cameraRphi);
      
      this.renderer.setViewport(this.camRhozVP);
      this.renderer.setScissor(this.camRhozVP);
      materials.forEach(m => (m as any).resolution?.set(this.camRhozVP.z, this.camRhozVP.w));
      this.renderer.render(this.scene, this.cameraRhoz);
    }

    this.renderer.setViewport(this.cam3DVP);
    this.renderer.setScissor(this.cam3DVP);
    materials.forEach(m => (m as any).resolution?.set(this.cam3DVP.z, this.cam3DVP.w));
    this.renderer.render(this.scene, this.camera3D);
  }

  // Reszta metod pomocniczych (resize, createScene, event handlers) pozostaje logicznie ta sama, 
  // ale z uwzględnieniem typowania TS...
  private resize(force: boolean) { /* Implementacja z Twojego kodu */ }
  ngAfterViewInit() { this.createScene(); this.renderingSubscription = this.rendernig.subscribe(() => this.render()); }
  ngOnDestroy() { this.renderingSubscription?.unsubscribe(); }

  private createScene() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, logarithmicDepthBuffer: true, antialias: true });
    this.renderer.setClearColor(0xFFFFFF);
    this.controls = new OrbitControls(this.camera3D, this.renderer.domElement);
    // ... reszta inicjalizacji sceny
  }
}