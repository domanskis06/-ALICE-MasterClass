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
  private hoverTrackMaterial: THREE.Material;
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
      (this.hoverTrackMaterial as LineMaterial).linewidth = this.trackWidth * 1.8;
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
  private trackHoverOverlayObj: THREE.Object3D | null = null;

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

  @Input() previousEventButtonDisabled: boolean = false;
  @Input() nextEventButtonDisabled: boolean = false;
  @Input()
  get detectorRphi(): string { return this._detectorRphi; }
  set detectorRphi(detectorRphi: string) {
    this._detectorRphi = detectorRphi;
    this.detectorSideViewsRphi.clear();
    if (!detectorRphi) return;

    this.loading = true;
    this.loaderSVG.load(detectorRphi, (data: SVGResult) => {
      const group = this.svgToGroup(data);
      group.scale.set(0.18, 0.18, 0.18);
      group.renderOrder = -1;
      this.detectorSideViewsRphi.add(group);
      this.loading = false;
    });
  }
  private _detectorRphi: string = null;

  @Input()
  get detectorRhoz(): string { return this._detectorRhoz; }
  set detectorRhoz(detectorRhoz: string) {
    this._detectorRhoz = detectorRhoz;
    this.detectorSideViewsRhoz.clear();
    if (!detectorRhoz) return;

    this.loading = true;
    this.loaderSVG.load(detectorRhoz, (data: SVGResult) => {
      const group = this.svgToGroup(data);
      group.rotateY(0.5 * Math.PI);
      group.scale.set(0.15, 0.15, 0.15);
      group.renderOrder = -1;
      this.detectorSideViewsRhoz.add(group);
      this.loading = false;
    });
  }
  private _detectorRhoz: string = null;

  onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    const hits = this.findIntersect(event);
    const hit = hits.find((h) => h.object?.userData && !(h.object as any).userData.__hoverOverlay);

    if (hit?.object?.userData && this.decays.visible) {
      this.trackClickedEvent.emit(hit.object.userData as Track);
    }
  }

  onPointerMove(event: PointerEvent): void {
    event.preventDefault();
    const hits = this.findIntersect(event);
    const hit = hits.find((h) => h.object?.userData && !(h.object as any).userData.__hoverOverlay);

    if (hit?.object?.userData && this.decays.visible) {
      if (this.trackHoverObj !== hit.object) {
        this.clearTrackHover();
        this.trackHoverObj = hit.object;
        const overlay = this.createHoverOverlay(hit.object as THREE.Object3D);
        if (overlay && (hit.object as any).parent) {
          (hit.object as any).parent.add(overlay);
          this.trackHoverOverlayObj = overlay;
        }
      }
      return;
    }

    this.clearTrackHover();
  }

  onPointerLeave(): void {
    this.clearTrackHover();
  }

  onPreviousEventClick(): void { this.previousEvent.emit(); }
  onNextEventClick(): void { this.nextEvent.emit(); }

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

  private svgToGroup(data: SVGResult): THREE.Group {
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
    return group;
  }

  @Input() set sideViewsShown(value: boolean) { this._sideViewsShown = value; this.resize(true); }
  get sideViewsShown(): boolean { return this._sideViewsShown; }
  private _sideViewsShown: boolean = true;

  @Input() set axesShown(value: boolean) { this._axesShown = value; this.axes.visible = value; }
  get axesShown(): boolean { return this._axesShown; }
  private _axesShown: boolean = true;

  @Input() set detectorShown(value: boolean) { this._detectorShown = value; this.detector.visible = value; this.detectorSideViews.visible = value; }
  get detectorShown(): boolean { return this._detectorShown; }
  private _detectorShown: boolean = true;

  @Input() set tracksShown(value: boolean) { this._tracksShown = value; this.tracks.visible = value; }
  get tracksShown(): boolean { return this._tracksShown; }
  private _tracksShown: boolean = true;
  @Input() hasClusters: boolean = false;
  @Input() set clustersShown(value: boolean) { this._clustersShown = value; this.clusters.visible = value; }
  get clustersShown(): boolean { return this._clustersShown; }
  private _clustersShown: boolean = true;

  @Input() set decaysShown(value: boolean) { this._decaysShown = value; this.decays.visible = value; }
  get decaysShown(): boolean { return this._decaysShown; }
  private _decaysShown: boolean = true;

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
    this.hoverTrackMaterial = new LineMaterial({
      color: 0xffeb3b,
      transparent: true,
      opacity: 0.75,
      ...lineParams
    });

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

    const materials = [
      this.trackMaterial,
      this.postiveTrackMaterial,
      this.negativeTrackMaterial,
      this.bachelorTrackMaterial,
      this.highlightTrackMaterial,
      this.hoverTrackMaterial
    ];

    this.renderer.setScissorTest(this.sideViewsShown);
    const oldVP = new THREE.Vector4();
    this.renderer.getViewport(oldVP);

    if (this.sideViewsShown) {
      // Render side views with 3D detector hidden.
      const detectorVisible = this.detector.visible;
      this.detector.visible = false;

      this.renderer.setViewport(this.camRphiVP);
      this.renderer.setScissor(this.camRphiVP);
      materials.forEach(m => (m as any).resolution?.set(this.camRphiVP.z, this.camRphiVP.w));
      this.renderer.render(this.scene, this.cameraRphi);

      this.renderer.setViewport(this.camRhozVP);
      this.renderer.setScissor(this.camRhozVP);
      materials.forEach(m => (m as any).resolution?.set(this.camRhozVP.z, this.camRhozVP.w));
      this.renderer.render(this.scene, this.cameraRhoz);

      this.detector.visible = detectorVisible;
    }

    // Render 3D view with side-view detector overlays hidden.
    const detectorSideViewsVisible = this.detectorSideViews.visible;
    this.detectorSideViews.visible = false;
    this.renderer.setViewport(this.cam3DVP);
    this.renderer.setScissor(this.cam3DVP);
    materials.forEach(m => (m as any).resolution?.set(this.cam3DVP.z, this.cam3DVP.w));
    this.renderer.render(this.scene, this.camera3D);
    this.detectorSideViews.visible = detectorSideViewsVisible;
  }

  private resize(force: boolean) {
    if (!this.canvas || !this.renderer) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const needResize = force || this.canvas.width !== width || this.canvas.height !== height;

    if (needResize) {
      this.renderer.setSize(width, height, false);

      // Update cameras
      if (this.camera3D) {
        this.camera3D.aspect = this.aspectRatio;
        this.camera3D.updateProjectionMatrix();
      }

      if (this.cameraRphi) {
        this.cameraRphi.aspect = this.aspectRatio;
        this.cameraRphi.updateProjectionMatrix();
      }

      if (this.cameraRhoz) {
        this.cameraRhoz.aspect = this.aspectRatio;
        this.cameraRhoz.updateProjectionMatrix();
      }

      // Update viewports for side views
      if (this.sideViewsShown) {
        const w = width;
        const h = height;
        const primaryRatio = this.PRIMARY_AXIS_RATIO;
        const secondaryRatio = this.SECONDARY_AXIS_RATIO;

        if (this.landscape) {
          const w1 = Math.floor(w * primaryRatio);
          const h1 = h;
          const w2 = w - w1;
          const h2 = Math.floor(h * secondaryRatio);
          const h3 = h - h2;

          this.cam3DVP.set(0, 0, w1, h1);
          this.camRphiVP.set(w1, h2, w2, h3);
          this.camRhozVP.set(w1, 0, w2, h2);
        } else {
          const w1 = w;
          const h1 = Math.floor(h * primaryRatio);
          const w2 = Math.floor(w * secondaryRatio);
          const h2 = h - h1;
          const w3 = w - w2;

          this.cam3DVP.set(0, h2, w1, h1);
          this.camRphiVP.set(0, 0, w2, h2);
          this.camRhozVP.set(w2, 0, w3, h2);
        }
      } else {
        this.cam3DVP.set(0, 0, width, height);
      }
    }
  }

  ngAfterViewInit() {
    this.createScene();
    this.renderingSubscription = this.rendernig.subscribe(() => this.render());
  }

  ngOnDestroy() {
    this.renderingSubscription?.unsubscribe();
    this.clearTrackHover();
  }

  private createScene() {
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      logarithmicDepthBuffer: true,
      antialias: true
    });
    this.renderer.setClearColor(0xFFFFFF);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Initialize cameras
    this.camera3D = new THREE.PerspectiveCamera(
      EventDisplayComponent.fieldOfView,
      this.aspectRatio,
      EventDisplayComponent.nearClippingPlane,
      EventDisplayComponent.farClippingPlane
    );
    this.camera3D.position.set(-7.5, 7.5, 2.5);
    this.camera3D.lookAt(0, 0, 0);

    this.cameraRphi = new THREE.PerspectiveCamera(
      EventDisplayComponent.fieldOfView,
      this.aspectRatio,
      EventDisplayComponent.nearClippingPlane,
      EventDisplayComponent.farClippingPlane
    );
    this.cameraRphi.position.set(0, 0, 10);
    this.cameraRphi.up.set(0, 1, 0);
    this.cameraRphi.lookAt(0, 0, 0);

    this.cameraRhoz = new THREE.PerspectiveCamera(
      EventDisplayComponent.fieldOfView,
      this.aspectRatio,
      EventDisplayComponent.nearClippingPlane,
      EventDisplayComponent.farClippingPlane
    );
    this.cameraRhoz.position.set(-10, 0, 0);
    this.cameraRhoz.up.set(0, 1, 0);
    this.cameraRhoz.lookAt(0, 0, 0);

    // Initialize controls
    this.controls = new OrbitControls(this.camera3D, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.lights.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 10, 10);
    this.lights.add(directionalLight);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    this.axes.add(axesHelper);

    // Build scene hierarchy
    this.scene.add(this.lights);
    this.scene.add(this.axes);
    this.detectorSideViews.clear();
    this.detectorSideViews.add(this.detectorSideViewsRphi);
    this.detectorSideViews.add(this.detectorSideViewsRhoz);
    this.scene.add(this.detector);
    this.scene.add(this.detectorSideViews);
    this.scene.add(this.tracks);
    this.scene.add(this.decays);
    this.scene.add(this.clusters);
    this.axes.visible = this._axesShown;
    this.detector.visible = this._detectorShown;
    this.detectorSideViews.visible = this._detectorShown;
    this.tracks.visible = this._tracksShown;
    this.decays.visible = this._decaysShown;
    this.clusters.visible = this._clustersShown;

    // Initial resize
    this.resize(true);
  }

  private findIntersect(event: MouseEvent): THREE.Intersection[] {
    const intersects: THREE.Intersection[] = [];
    if (!this.renderer || !this.controls) return intersects;

    const zoomz = this.controls.target.distanceTo(this.controls.object.position);
    const raycaster = new THREE.Raycaster();
    (raycaster.params as any).Line2 = (raycaster.params as any).Line2 || { threshold: zoomz / 55 };
    (raycaster.params as any).Line2.threshold = zoomz / 55;
    (raycaster.params as any).Line = (raycaster.params as any).Line || { threshold: zoomz / 55 };
    (raycaster.params as any).Line.threshold = zoomz / 55;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const viewportClick = new THREE.Vector2(
      event.clientX - rect.left,
      -(event.clientY - rect.top) + this.renderer.domElement.clientHeight
    );

    const viewports = this.sideViewsShown
      ? [
          { view: this.cam3DVP, cam: this.camera3D },
          { view: this.camRphiVP, cam: this.cameraRphi },
          { view: this.camRhozVP, cam: this.cameraRhoz },
        ]
      : [{ view: this.cam3DVP, cam: this.camera3D }];

    for (const v of viewports) {
      const ndc = new THREE.Vector2(
        ((viewportClick.x - v.view.x) / v.view.z - 0.5) * 2,
        ((viewportClick.y - v.view.y) / v.view.w - 0.5) * 2
      );
      if (ndc.x < -1 || ndc.x > 1 || ndc.y < -1 || ndc.y > 1) continue;
      raycaster.setFromCamera(ndc, v.cam);
      if (this.decays.children.length > 0) {
        intersects.push(...raycaster.intersectObjects(this.decays.children, true));
      }
    }

    intersects.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    return intersects;
  }

  private clearTrackHover(): void {
    if (this.trackHoverObj) {
      this.trackHoverObj = null;
    }
    if (this.trackHoverOverlayObj?.parent) {
      this.trackHoverOverlayObj.parent.remove(this.trackHoverOverlayObj);
    }
    this.trackHoverOverlayObj = null;
  }

  private createHoverOverlay(target: THREE.Object3D): THREE.Object3D | null {
    if (!(target as any).geometry) return null;

    if (target instanceof Line2) {
      const overlay = new Line2((target as any).geometry, this.hoverTrackMaterial as LineMaterial);
      overlay.computeLineDistances();
      overlay.position.copy(target.position);
      overlay.quaternion.copy(target.quaternion);
      overlay.scale.copy(target.scale);
      overlay.renderOrder = 1000;
      (overlay as any).userData = { __hoverOverlay: true };
      return overlay;
    }
    return null;
  }
}
