// ══════════════════════════════════════════════════════════
//  Boulder Escape - main.js
//  Evaluacion T2 - Computacion Grafica y Visual
//  Tecnologia: Three.js 0.180.0 (CDN via importmap)
// ══════════════════════════════════════════════════════════

import * as THREE from 'three';

// ──────────────────────────────────────
//  1. ESCENA, CAMARA Y RENDERIZADOR
// ──────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6AAFD6);
scene.fog = new THREE.Fog(0x6AAFD6, 35, 90);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 7.2, 12.8);
camera.lookAt(0, 1.4, -2.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// ──────────────────────────────────────
//  2. ILUMINACION
// ──────────────────────────────────────
// Luz ambiental base (elimina zonas completamente negras)
scene.add(new THREE.AmbientLight(0xFFFFFF, 1.8));

// Luz sky/ground para gradiente natural
scene.add(new THREE.HemisphereLight(0xBBDDFF, 0xCC9966, 2.2));

// Luz solar principal (sin sombra para evitar zonas oscuras)
const sol = new THREE.DirectionalLight(0xFFEEB0, 3.5);
sol.position.set(5, 18, 12);
scene.add(sol);

// Luz de relleno frontal (ilumina la cara del personaje)
const luzFrontal = new THREE.DirectionalLight(0xCCDDFF, 2.0);
luzFrontal.position.set(0, 5, 15);
scene.add(luzFrontal);

// Luz de relleno lateral
const luzLateral = new THREE.DirectionalLight(0xFFD0A0, 1.5);
luzLateral.position.set(-8, 8, -5);
scene.add(luzLateral);

// ──────────────────────────────────────
//  3. TEXTURAS PROCEDURALES (sin archivos externos)
// ──────────────────────────────────────

// Textura de piedra para la roca
function crearTexturaRoca() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base gris-marrón
  ctx.fillStyle = '#7A7068';
  ctx.fillRect(0, 0, size, size);

  // Manchas de variación de color
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 22 + 4;
    const v = Math.floor(85 + Math.random() * 70);
    const vr = Math.floor(v * 0.95);
    const vb = Math.floor(v * 0.82);
    ctx.globalAlpha = 0.6 + Math.random() * 0.4;
    ctx.fillStyle = `rgb(${vr},${v-8},${vb})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Grietas oscuras
  ctx.strokeStyle = '#3a3028';
  for (let i = 0; i < 25; i++) {
    const x1 = Math.random() * size, y1 = Math.random() * size;
    const x2 = x1 + (Math.random() - 0.5) * 120;
    const y2 = y1 + (Math.random() - 0.5) * 120;
    ctx.lineWidth = Math.random() * 2.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Textura de camino/suelo con lineas de carril
function crearTexturaSuelo() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#C4A97B';
  ctx.fillRect(0, 0, 256, 512);

  // Variacion de grano
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 512;
    const v = Math.floor(160 + Math.random() * 50);
    const vg = Math.floor(v * 0.85);
    const vb = Math.floor(v * 0.65);
    ctx.fillStyle = `rgba(${v},${vg},${vb},0.4)`;
    ctx.fillRect(x, y, Math.random() * 18 + 3, Math.random() * 5 + 1);
  }

  // Linea de carril central discontinua
  ctx.fillStyle = 'rgba(255,255,220,0.4)';
  for (let y = 0; y < 512; y += 80) {
    ctx.fillRect(122, y, 12, 40);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 12);
  return tex;
}

const texturaRoca  = crearTexturaRoca();
const texturaSuelo = crearTexturaSuelo();

// ──────────────────────────────────────
//  4. CAMINO Y ESCENARIO (REQ-01)
// ──────────────────────────────────────
const ANCHO_CAMINO = 7;

// Suelo amplio (cubre toda la escena visible)
const matSuelo = new THREE.MeshStandardMaterial({
  map: texturaSuelo, roughness: 0.95
});
const suelo = new THREE.Mesh(new THREE.PlaneGeometry(60, 400), matSuelo);
suelo.rotation.x = -Math.PI / 2;
suelo.position.set(0, 0, -170);
scene.add(suelo);

// Camino central mas claro (resalta sobre el suelo)
const matCamino = new THREE.MeshStandardMaterial({ color: 0xD4B882, roughness: 0.9 });
const camino = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO_CAMINO, 400), matCamino);
camino.rotation.x = -Math.PI / 2;
camino.position.set(0, 0.01, -170);
scene.add(camino);

// Paredes de canyon a los lados (bien separadas, sin sombras)
const matPared = new THREE.MeshStandardMaterial({ color: 0xB08850, roughness: 0.88 });

function crearPared(xPos) {
  const pared = new THREE.Mesh(
    new THREE.BoxGeometry(8, 8, 400),
    matPared
  );
  pared.position.set(xPos, 3, -170);
  scene.add(pared);
}
crearPared(-(ANCHO_CAMINO / 2 + 7));
crearPared( (ANCHO_CAMINO / 2 + 7));




// Decoracion: columnas/rocas a los lados del camino
const matRocaDeco = new THREE.MeshStandardMaterial({ color: 0x887060, roughness: 1 });
for (let z = -10; z > -160; z -= 14) {
  [-4.5, 4.5].forEach(x => {
    const h = Math.random() * 2.5 + 1;
    const roca = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3 + Math.random() * 0.3, 0.5 + Math.random() * 0.3, h, 6),
      matRocaDeco
    );
    roca.position.set(x, h / 2, z);
    roca.castShadow = true;
    scene.add(roca);
  });
}

// ──────────────────────────────────────
//  5. PERSONAJE PRINCIPAL (RF02)
//     Construido con geometrias basicas
// ──────────────────────────────────────
const personaje = new THREE.Group();

// Cuerpo (torso)
const matCuerpo = new THREE.MeshStandardMaterial({ color: 0xFF6600, roughness: 0.7 });
const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.5), matCuerpo);
cuerpo.position.y = 1.0;
cuerpo.castShadow = true;
personaje.add(cuerpo);

// Cabeza
const matCabeza = new THREE.MeshStandardMaterial({ color: 0xFFCBA4, roughness: 0.6 });
const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), matCabeza);
cabeza.position.y = 1.77;
cabeza.castShadow = true;
personaje.add(cabeza);

// Ojos (esferas pequenas negras)
const matOjo = new THREE.MeshBasicMaterial({ color: 0x111111 });
[-0.1, 0.1].forEach(x => {
  const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matOjo);
  ojo.position.set(x, 1.82, 0.29);
  personaje.add(ojo);
});

// Piernas
const matPierna = new THREE.MeshStandardMaterial({ color: 0x224499, roughness: 0.8 });
const geopierna = new THREE.BoxGeometry(0.26, 0.58, 0.28);
const piernaIzq = new THREE.Mesh(geopierna, matPierna);
piernaIzq.position.set(-0.2, 0.28, 0);
piernaIzq.castShadow = true;
personaje.add(piernaIzq);

const piernaDer = new THREE.Mesh(geopierna, matPierna);
piernaDer.position.set(0.2, 0.28, 0);
piernaDer.castShadow = true;
personaje.add(piernaDer);

// Brazos
const matBrazo = new THREE.MeshStandardMaterial({ color: 0xFF6600, roughness: 0.7 });
const geoBrazo = new THREE.BoxGeometry(0.22, 0.55, 0.22);
const brazoIzq = new THREE.Mesh(geoBrazo, matBrazo);
brazoIzq.position.set(-0.5, 1.0, 0);
brazoIzq.castShadow = true;
personaje.add(brazoIzq);

const brazoDer = new THREE.Mesh(geoBrazo, matBrazo);
brazoDer.position.set(0.5, 1.0, 0);
brazoDer.castShadow = true;
personaje.add(brazoDer);

personaje.position.set(0, 0, 0);
scene.add(personaje);

// ──────────────────────────────────────
//  6. ROCA GIGANTE (RF03)
// ──────────────────────────────────────
const matRoca = new THREE.MeshStandardMaterial({
  map: texturaRoca,
  roughness: 0.92,
  metalness: 0.04
});
const roca = new THREE.Mesh(new THREE.SphereGeometry(2.3, 32, 24), matRoca);
roca.castShadow = true;
roca.position.set(0, 2.3, -10);
scene.add(roca);

// ──────────────────────────────────────
//  7. OBSTACULOS (RF04) - Conos puntiagudos
// ──────────────────────────────────────
const obstaculos = [];
const Z_SPAWN    = 9.5;
const VELOCIDAD_OBSTACULO = 7.5;
const CARRILES   = [-2.3, 0, 2.3];

function generarObstaculo() {
  // Elegimos cuantos carriles bloquear: 1 o 2 (siempre queda al menos 1 libre)
  const nBloquear = Math.random() < 0.55 ? 1 : 2;
  const carrilesAleatorios = [...CARRILES].sort(() => Math.random() - 0.5);
  const bloqueados = carrilesAleatorios.slice(0, nBloquear);

  bloqueados.forEach(xCarril => {
    const alturaObst = Math.random() * 0.7 + 1.2;
    const cono = new THREE.Mesh(
      new THREE.ConeGeometry(0.52, alturaObst, 6),
      new THREE.MeshStandardMaterial({ color: 0x8B3A2A, roughness: 0.8 })
    );
    cono.position.set(
      xCarril + (Math.random() - 0.5) * 0.4,
      alturaObst / 2,
      Z_SPAWN
    );
    cono.castShadow = true;
    scene.add(cono);
    obstaculos.push(cono);
  });
}

// ──────────────────────────────────────
//  8. TECLADO (RF05)
// ──────────────────────────────────────
const teclas = {};
window.addEventListener('keydown', e => {
  teclas[e.key] = true;
  if (e.key === 'r' || e.key === 'R') reiniciarJuego();
  if ((e.key === ' ' || e.key === 'Enter') && !juegoIniciado) iniciarJuego();
});
window.addEventListener('keyup',   e => { teclas[e.key] = false; });

// ──────────────────────────────────────
//  9. ESTADO DEL JUEGO
// ──────────────────────────────────────
let juegoIniciado = false;
let gameOver      = false;
let puntuacion    = 0;
let timerObstaculo = 0;
const INTERVALO_OBSTACULO = 2.0;   // segundos entre oleadas
const VEL_PERSONAJE       = 6.5;
const LIMITE_LATERAL      = ANCHO_CAMINO / 2 - 0.55;

// Referencias al DOM
const elScore     = document.getElementById('score');
const elGameOver  = document.getElementById('game-over');
const elFinalScore = document.getElementById('final-score');
const elStartScreen = document.getElementById('start-screen');

function iniciarJuego() {
  juegoIniciado = true;
  elStartScreen.style.display = 'none';
}

function mostrarGameOver() {
  elFinalScore.textContent = `Llegaste: ${Math.floor(puntuacion)}m`;
  elGameOver.style.display = 'flex';
}

function reiniciarJuego() {
  if (!gameOver) return;
  gameOver       = false;
  puntuacion     = 0;
  timerObstaculo = 0;

  obstaculos.forEach(o => scene.remove(o));
  obstaculos.length = 0;

  personaje.position.set(0, 0, 0);
  personaje.rotation.z = 0;
  roca.position.set(0, 2.3, -10);

  elGameOver.style.display = 'none';
}

// Clic para iniciar
document.getElementById('start-screen').addEventListener('click', iniciarJuego);

// ──────────────────────────────────────
//  10. CLOCK
// ──────────────────────────────────────
const reloj = new THREE.Clock();

// ──────────────────────────────────────
//  11. BUCLE DE ANIMACION (RF05)
// ──────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(reloj.getDelta(), 0.05);
  const t     = reloj.getElapsedTime();

  if (juegoIniciado && !gameOver) {
    actualizarPersonaje(delta, t);
    actualizarRoca(delta);
    actualizarObstaculos(delta);
    detectarColisiones();
    actualizarCamara();
    moverTexturaSuelo(delta);

    puntuacion += delta * 10;
    elScore.textContent = `Metros: ${Math.floor(puntuacion)}m`;
  }

  renderer.render(scene, camera);
}

// ─────────────────────────────────
//  11a. Actualizar personaje (RF02)
// ─────────────────────────────────
function actualizarPersonaje(delta, t) {
  const vel = VEL_PERSONAJE * delta;

  if (teclas['a'] || teclas['ArrowLeft'])  personaje.position.x -= vel;
  if (teclas['d'] || teclas['ArrowRight']) personaje.position.x += vel;

  // Restringir a los limites del camino
  personaje.position.x = Math.max(-LIMITE_LATERAL, Math.min(LIMITE_LATERAL, personaje.position.x));

  // Animacion de carrera: piernas y brazos oscilan con seno
  const oscilacion = Math.sin(t * 11);
  piernaIzq.position.y = 0.28 + oscilacion * 0.18;
  piernaDer.position.y = 0.28 - oscilacion * 0.18;
  brazoIzq.rotation.x  =  oscilacion * 0.45;
  brazoDer.rotation.x  = -oscilacion * 0.45;

  // Inclinacion visual al moverse lateralmente
  const inclinacion = (teclas['a'] || teclas['ArrowLeft']) ? 0.18 :
                      (teclas['d'] || teclas['ArrowRight']) ? -0.18 : 0;
  personaje.rotation.z = THREE.MathUtils.lerp(personaje.rotation.z, inclinacion, 0.12);

  // Leve rebote vertical al correr
  personaje.position.y = Math.abs(Math.sin(t * 11)) * 0.07;
}

// ─────────────────────────────────
//  11b. Actualizar roca (RF03)
// ─────────────────────────────────
function actualizarRoca(delta) {
  // Rotacion continua para simular rodamiento
  roca.rotation.x += 2.0 * delta;
  roca.rotation.z += 0.3 * delta;

  // La roca sigue al personaje en X (lerp suave = sensacion de persecucion)
  roca.position.x = THREE.MathUtils.lerp(roca.position.x, personaje.position.x, 0.035);
}

// ─────────────────────────────────
//  11c. Actualizar obstaculos (RF04)
// ─────────────────────────────────
function actualizarObstaculos(delta) {
  timerObstaculo += delta;
  if (timerObstaculo >= INTERVALO_OBSTACULO) {
    timerObstaculo = 0;
    generarObstaculo();
  }

  // Mover obstaculos en sentido contrario al avance del personaje (hacia el fondo / roca)
  for (let i = obstaculos.length - 1; i >= 0; i--) {
    obstaculos[i].position.z -= VELOCIDAD_OBSTACULO * delta;

    // Eliminar si ya paso de largo (detras de la roca)
    if (obstaculos[i].position.z < -40) {
      scene.remove(obstaculos[i]);
      obstaculos.splice(i, 1);
    }
  }
}

// ─────────────────────────────────
//  11d. Deteccion de colisiones (RF05)
// ─────────────────────────────────
function detectarColisiones() {
  const px = personaje.position.x;
  const pz = personaje.position.z;

  for (const obs of obstaculos) {
    const dx   = px - obs.position.x;
    const dz   = pz - obs.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.85) {
      gameOver = true;
      mostrarGameOver();
      return;
    }
  }
}

// ─────────────────────────────────
//  11e. Camara frontal (RF05)
// ─────────────────────────────────
function actualizarCamara() {
  // La camara sigue al personaje en X de forma suave con vista frontal elevada
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, personaje.position.x, 0.08);
  camera.position.y = 7.2;
  camera.position.z = 12.8;
  // Mira hacia el camino frente y a traves del personaje
  camera.lookAt(personaje.position.x, 1.4, -2.5);
}


// ─────────────────────────────────
//  11f. Ilusion de movimiento del suelo
// ─────────────────────────────────
function moverTexturaSuelo(delta) {
  // Desplazar el UV del suelo para dar sensacion de velocidad
  texturaSuelo.offset.y -= 0.55 * delta;
}

// ──────────────────────────────────────
//  12. RESPONSIVE
// ──────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ──────────────────────────────────────
//  ARRANCAR
// ──────────────────────────────────────
animate();
