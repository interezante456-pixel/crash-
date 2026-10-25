# Boulder Escape - Evaluacion T2

Videojuego 3D de persecucion desarrollado con Three.js para la asignatura de Computacion Grafica y Visual.

## Tecnologias
- HTML5
- JavaScript (ES Modules)
- Three.js 0.180.0 (via CDN con importmap)
- Sin dependencias adicionales, sin Node.js

## Como ejecutar

### Opcion 1: Python (recomendado)
1. Abre una terminal en la carpeta boulder_escape/
2. Ejecuta:

   Windows:
   py -m http.server 8000

3. Abre en el navegador: http://localhost:8000

### Opcion 2: Live Server (VS Code)
1. Instala la extension "Live Server" en VS Code
2. Haz clic derecho en index.html > "Open with Live Server"

> IMPORTANTE: No abrir index.html directamente con doble clic (protocolo file://).
> Three.js requiere ser servido via HTTP para funcionar correctamente.

## Controles
| Tecla        | Accion                     |
|--------------|----------------------------|
| A / Flecha izquierda | Mover personaje a la izquierda |
| D / Flecha derecha   | Mover personaje a la derecha   |
| R            | Reiniciar tras Game Over   |
| Espacio/Clic | Iniciar el juego           |

## Estructura de archivos
boulder_escape/
- index.html  --> Estructura HTML, HUD e importmap de Three.js
- main.js     --> Logica completa del juego
- style.css   --> Estilos de HUD, Game Over y pantalla de inicio
- README.md   --> Este archivo

## Requerimientos cubiertos
- REQ-01: Escena 3D con suelo, camino, paredes de canyon, camara en perspectiva, iluminacion y requestAnimationFrame
- RF02: Personaje con geometrias basicas, control A/D y flechas, limite lateral de camino
- RF03: SphereGeometry con textura procedural de piedra via CanvasTexture, rotacion continua, posicion detras del personaje
- RF04: ConeGeometry como obstaculos puntiagudos, posicion aleatoria en carriles, siempre esquivables
- RF05: Carrera automatica, colision con distanceTo, Game Over y reinicio con R
