import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { inRegion, organRegion, systemColors } from "./domain";
import type { Manifest, Organ, Region, System } from "./domain";

export interface Structure {
  id: string;
  organ: Organ;
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  center: THREE.Vector3;
  baseColor: THREE.Color;
  bounds: THREE.Box3;
}
export interface Layer {
  visible: boolean;
  opacity: number;
}
export class AnatomyViewer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(35, 1, 0.001, 30);
  readonly controls: OrbitControls;
  readonly structures = new Map<string, Structure>();
  private roots = new Map<System, THREE.Group>();
  private pending = new Map<System, Promise<void>>();
  private loader: GLTFLoader;
  private draco: DRACOLoader;
  private raycaster = new THREE.Raycaster();
  private pinPoint: THREE.Vector3 | null = null;
  private selected: string | null = null;
  private hidden = new Set<string>();
  private occluders = new Set<string>();
  private isolated: string | null = null;
  private quiz = false;
  private region: Region = "exam";
  private depth: "all" | "superficial" | "deep" = "all";
  private layers = new Map<System, Layer>();
  private observer: ResizeObserver;
  private previousPointer = new THREE.Vector2();
  private frame = 0;
  private needsRender = true;
  private disposed = false;
  onSelect: (structure: Structure, point: THREE.Vector3) => void = () => {};
  onHover: (structure: Structure | null) => void = () => {};
  constructor(
    private host: HTMLElement,
    private pin: HTMLElement,
    private manifest: Manifest,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor("#f5f7f7", 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    host.prepend(this.renderer.domElement);
    this.renderer.domElement.setAttribute(
      "aria-label",
      "Interaktywny model anatomiczny. Obracaj przeciągając, powiększaj kółkiem myszy. Struktury możesz też wybierać z listy.",
    );
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9da5a5, 2.2));
    const key = new THREE.DirectionalLight(0xfff6ea, 3);
    key.position.set(-3, 5, 4);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xe1edf5, 1.8);
    fill.position.set(3, 2, -2);
    this.scene.add(fill);
    this.camera.position.set(0, 0.85, 3.15);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.85, 0);
    this.controls.enableDamping = false;
    this.controls.minDistance = 0.025;
    this.controls.maxDistance = 6;
    this.controls.addEventListener("change", () => {
      this.needsRender = true;
    });
    this.draco = new DRACOLoader();
    this.draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
    this.draco.setWorkerLimit(2);
    this.loader = new GLTFLoader().setDRACOLoader(this.draco);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.renderer.domElement.addEventListener("pointerdown", this.pointerDown);
    this.renderer.domElement.addEventListener("pointerup", this.pointerUp);
    this.renderer.domElement.addEventListener("pointermove", this.pointerMove);
    this.renderer.domElement.addEventListener("pointerleave", () =>
      this.onHover(null),
    );
    this.animate();
  }
  private resize(): void {
    const { width, height } = this.host.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.needsRender = true;
  }
  private animate = (): void => {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.animate);
    if (!this.needsRender) return;
    this.renderer.render(this.scene, this.camera);
    this.updatePin();
    this.needsRender = false;
  };
  private pointerDown = (event: PointerEvent): void => {
    this.previousPointer.set(event.clientX, event.clientY);
  };
  private hit(
    event: PointerEvent,
  ): THREE.Intersection<THREE.Object3D> | undefined {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.raycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      this.camera,
    );
    return this.raycaster.intersectObjects(
      [...this.structures.values()]
        .filter((s) => s.mesh.visible)
        .map((s) => s.mesh),
      false,
    )[0];
  }
  private structureFor(object: THREE.Object3D): Structure | undefined {
    const id: unknown = object.userData.structureId;
    return typeof id === "string" ? this.structures.get(id) : undefined;
  }
  private pointerUp = (event: PointerEvent): void => {
    if (
      this.quiz ||
      this.previousPointer.distanceTo(
        new THREE.Vector2(event.clientX, event.clientY),
      ) > 5
    )
      return;
    const hit = this.hit(event);
    if (!hit) return;
    const structure = this.structureFor(hit.object);
    if (structure) this.onSelect(structure, hit.point);
  };
  private hoverAt = 0;
  private pointerMove = (event: PointerEvent): void => {
    if (this.quiz || event.buttons || performance.now() - this.hoverAt < 100)
      return;
    this.hoverAt = performance.now();
    const hit = this.hit(event);
    this.onHover(hit ? (this.structureFor(hit.object) ?? null) : null);
  };
  async load(system: System): Promise<void> {
    if (this.roots.has(system)) return;
    const existing = this.pending.get(system);
    if (existing) return existing;
    const task = this.loadSystem(system);
    this.pending.set(system, task);
    try {
      await task;
    } finally {
      this.pending.delete(system);
    }
  }
  private async loadSystem(system: System): Promise<void> {
    const organs = this.manifest.organs.filter((o) => o.system === system);
    const files = [...new Set(organs.map((organ) => organ.mesh_file))];
    for (const file of files) {
      const gltf = await this.loader.loadAsync(
        `${import.meta.env.BASE_URL}anatomy/${file}`,
      );
      if (this.disposed) {
        gltf.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) obj.geometry.dispose();
        });
        return;
      }
      const byName = new Map(organs.map((o) => [o.node, o]));
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const original: unknown = object.userData.name;
        const organ = byName.get(
          typeof original === "string" ? original : object.name,
        );
        if (!organ) {
          object.visible = false;
          return;
        }
        const previous: THREE.Material | THREE.Material[] = object.material;
        if (Array.isArray(previous)) previous.forEach((m) => m.dispose());
        else previous.dispose();
        const color =
          system === "cardiovascular" && /vein|vena/i.test(organ.name_en)
            ? "#526d9a"
            : systemColors[system];
        const material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.68,
          metalness: 0,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(object.geometry, material);
        mesh.name = object.name;
        mesh.applyMatrix4(object.matrixWorld);
        mesh.updateMatrixWorld(true);
        mesh.userData.structureId = organ.organ_id;
        const bounds = new THREE.Box3().setFromObject(mesh);
        this.structures.set(organ.organ_id, {
          id: organ.organ_id,
          organ,
          mesh,
          bounds,
          center: bounds.getCenter(new THREE.Vector3()),
          baseColor: material.color.clone(),
        });
      });
    }
    const root = new THREE.Group();
    for (const s of this.structures.values())
      if (s.organ.system === system) root.add(s.mesh);
    this.roots.set(system, root);
    this.scene.add(root);
    this.applyVisibility();
  }
  setLayers(
    layers: Map<System, Layer>,
    region: Region,
    depth: "all" | "superficial" | "deep",
  ): void {
    this.layers = layers;
    this.region = region;
    this.depth = depth;
    this.applyVisibility();
  }
  private applyVisibility(): void {
    for (const s of this.structures.values()) {
      const layer = this.layers.get(s.organ.system);
      const path = s.organ.path.join(" ").toLowerCase();
      const insertion = /muscular insertions/.test(path);
      const deep = /deep|transversospinal|epaxial|suboccipital/.test(path);
      const depthVisible =
        s.organ.system !== "muscular" ||
        (!insertion &&
          (this.depth === "all" ||
            (this.depth === "deep" && deep) ||
            (this.depth === "superficial" && !deep)));
      s.mesh.visible =
        Boolean(layer?.visible) &&
        inRegion(s.organ, this.region, s.center.y) &&
        depthVisible &&
        !this.hidden.has(s.id) &&
        !this.occluders.has(s.id) &&
        (this.isolated === null || this.isolated === s.id);
      s.mesh.material.opacity = layer?.opacity ?? 1;
      s.mesh.material.transparent = s.mesh.material.opacity < 1;
      s.mesh.material.depthWrite = s.mesh.material.opacity >= 0.95;
      s.mesh.material.color.copy(s.baseColor);
      if (s.id === this.selected && !this.quiz)
        s.mesh.material.color.set("#146f86");
      s.mesh.material.emissive.set(
        s.id === this.selected && !this.quiz ? "#315e65" : "#000000",
      );
      s.mesh.material.emissiveIntensity = 0.28;
    }
    this.needsRender = true;
  }
  visible(): Structure[] {
    return [...this.structures.values()].filter((s) => s.mesh.visible);
  }
  candidates(quizSystems: ReadonlySet<System>): Structure[] {
    return this.visible().filter(
      (s) =>
        quizSystems.has(s.organ.system) &&
        !s.organ.path.includes("Muscular insertions"),
    );
  }
  select(id: string | null, point?: THREE.Vector3): void {
    this.selected = id;
    this.pinPoint = point ?? null;
    this.pin.classList.toggle("quiz-pin", this.quiz);
    this.applyVisibility();
  }
  focus(id: string): void {
    const s = this.structures.get(id);
    if (s) this.frameBounds(s.bounds, 2.5);
  }
  private frameBounds(box: THREE.Box3, padding = 1.45): void {
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const distance =
      (Math.max(size.y, size.x / this.camera.aspect, size.z, 0.025) /
        2 /
        Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) *
      padding;
    const direction = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize();
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.controls.update();
    this.needsRender = true;
  }
  fit(): void {
    const box = new THREE.Box3();
    for (const s of this.visible()) box.union(s.bounds);
    if (!box.isEmpty()) this.frameBounds(box);
  }
  view(direction: "front" | "back" | "left" | "right"): void {
    const distance = this.camera.position.distanceTo(this.controls.target);
    const v = new THREE.Vector3(
      direction === "left" ? 1 : direction === "right" ? -1 : 0,
      0,
      direction === "front" ? 1 : direction === "back" ? -1 : 0,
    );
    this.camera.position
      .copy(this.controls.target)
      .addScaledVector(v, distance);
    this.camera.up.set(0, 1, 0);
    this.controls.update();
    this.needsRender = true;
  }
  zoom(factor: number): void {
    const d = this.camera.position
      .clone()
      .sub(this.controls.target)
      .multiplyScalar(factor);
    this.camera.position.copy(this.controls.target).add(d);
    this.controls.update();
    this.needsRender = true;
  }
  isolate(id: string | null): void {
    this.isolated = id;
    this.applyVisibility();
    if (id) this.focus(id);
  }
  hide(id: string): void {
    this.hidden.add(id);
    this.select(null);
  }
  restore(): void {
    this.hidden.clear();
    this.occluders.clear();
    this.isolated = null;
    this.select(null);
  }
  setQuiz(value: boolean): void {
    this.quiz = value;
    this.occluders.clear();
    this.pin.classList.toggle("quiz-pin", value);
    this.applyVisibility();
  }
  prepareQuestion(id: string): boolean {
    this.occluders.clear();
    this.isolated = null;
    this.applyVisibility();
    const target = this.structures.get(id);
    if (!target) return false;
    this.focus(id);
    const direction = this.camera.position
      .clone()
      .sub(target.center)
      .normalize();
    // A mesh intersection, rather than a bounding-box point, anchors the pin to actual anatomy.
    const positions = target.mesh.geometry.getAttribute("position");
    let surface: THREE.Vector3 | null = null;
    for (let i = 0; i < Math.min(positions.count, 60); i++) {
      const index = Math.floor(
        (i * positions.count) / Math.min(positions.count, 60),
      );
      const point = new THREE.Vector3()
        .fromBufferAttribute(positions, index)
        .applyMatrix4(target.mesh.matrixWorld);
      this.raycaster.set(
        point.clone().addScaledVector(direction, 2),
        direction.clone().negate(),
      );
      const intersection = this.raycaster.intersectObject(
        target.mesh,
        false,
      )[0];
      if (intersection) {
        surface = intersection.point;
        break;
      }
    }
    if (!surface) return false;
    this.raycaster.set(
      this.camera.position,
      surface.clone().sub(this.camera.position).normalize(),
    );
    const hits = this.raycaster.intersectObjects(
      this.visible().map((s) => s.mesh),
      false,
    );
    const targetDistance = this.camera.position.distanceTo(surface);
    for (const hit of hits) {
      const s = this.structureFor(hit.object);
      if (s && s.id !== id && hit.distance < targetDistance - 0.0001)
        this.occluders.add(s.id);
    }
    this.selected = id;
    this.pinPoint = surface;
    this.applyVisibility();
    return true;
  }
  private updatePin(): void {
    if (!this.pinPoint) {
      this.pin.hidden = true;
      return;
    }
    const p = this.pinPoint.clone().project(this.camera);
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    this.pin.hidden =
      p.z > 1 || p.z < -1 || Math.abs(p.x) > 1 || Math.abs(p.y) > 1;
    this.pin.style.left = `${((p.x + 1) / 2) * width}px`;
    this.pin.style.top = `${((-p.y + 1) / 2) * height}px`;
  }
  regionOf(s: Structure): string {
    return organRegion(s.organ, s.center.y);
  }
  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.controls.dispose();
    this.draco.dispose();
    for (const s of this.structures.values()) {
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
    }
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
