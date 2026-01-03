# Certification Tests (Angular)

Aplicación Angular sencilla para practicar tests de certificaciones (ej. TOGAF 10, GH-300) siguiendo buenas prácticas básicas: componentes standalone, servicios para lógica, modelos tipados, routing y separación de responsabilidades.

Características:
- Pantalla inicial con lista de certificaciones (incluye TOGAF 10 y GH-300. Se mantiene una opción con todos los módulos aleatorios).
- Configuración del examen: subir archivo de preguntas en texto, elegir bloque (1 a 6 o Todos), número de preguntas y modo de feedback (inmediato o al final).
- Ejecución del test: navegación por preguntas, feedback inmediato opcional.
- Resultados: puntuación y revisión de respuestas correctas/incorrectas.

## Formato del archivo de preguntas
Archivo de texto plano. Reglas:
- Cada pregunta comienza con una línea que empieza por `Q:`.
- Opciones en líneas separadas con prefijo `A)`, `B)`, `C)`, `D)` (u otras letras).
- Marca la opción correcta anteponiendo un `*` justo después del paréntesis, por ejemplo: `B) *Texto correcto`.
- Opcional: indica el bloque al que pertenecen con una línea `#BLOCK n` (n = 0..6). Si usas `#BLOCK 0` o no indicas bloque, la pregunta se considera "sin bloque" y entra en la opción "Todos".
- Las líneas vacías separan preguntas. Las líneas que empiezan por `//` son comentarios.
- Puedes añadir imágenes de referencia en medio de la pregunta usando etiquetas `<image>...</image>` con rutas bajo `assets/`, por ejemplo: `<image>assets/q5_image.png</image>`. Se soportan múltiples imágenes por pregunta.

Ejemplos: 
- `src/assets/examples/togaf-sample.txt` (TOGAF 10 con 6 bloques)
- `src/assets/examples/gh300-sample.txt` (GitHub Copilot Fundamentals GH-300 con 7 bloques)

```
#BLOCK 1
Q: TOGAF se define como un marco de trabajo para...
A) La gestión de proyectos
B) *El desarrollo y la gestión de arquitectura empresarial
C) La administración de redes
D) El diseño de bases de datos
```

## Scripts
- `npm install`
- `npm start` ? abre http://localhost:4200
- `npm run build` ? compila a `dist/`

Requisitos: Node 18+.

## Estructura principal
- `src/app/app.component.ts` Shell con router.
- `src/app/app.routes.ts` Rutas: home, setup, quiz, results, review.
- `src/app/models.ts` Modelos tipados.
- `src/app/services/question-parser.service.ts` Parser del archivo de preguntas.
- `src/app/services/quiz.service.ts` Estado y flujo del examen.
- `src/app/pages/*` Componentes de UI.
- `src/assets/examples/` Archivos de ejemplo (togaf-sample.txt, gh300-sample.txt).

## Buenas prácticas aplicadas
- Componentes standalone (Angular 17) para reducir boilerplate.
- Servicios inyectables para lógica (parsing, estado del quiz).
- Modelos TypeScript para tipado fuerte.
- Ruteo claro y separación de responsabilidades.
- UI mínima accesible y responsive.

## Notas
- Si no indicas `#BLOCK`, las preguntas se consideran del conjunto general y entran en "Todos".
- Los bloques van desde `#BLOCK 0` (preguntas generales) hasta `#BLOCK 6` o `#BLOCK 7` según la certificación:
  - TOGAF 10: 6 bloques temáticos (1-6)
  - GH-300 (GitHub Copilot Fundamentals): 7 bloques temáticos (1-7), más el bloque 0 para preguntas generales
- El máximo de preguntas permitido se ajusta automáticamente al número de preguntas disponibles del bloque elegido.
- Puedes preparar diferentes archivos por certificación; la app no fuerza un esquema específico de certificación.

@JuanCBM

## Despliegue en GitHub Pages y URL pública
- Ruta base (base href) de la app: `/certification-tests-web`
- URL pública: https://juancbm.github.io/certification-tests-web/
- Rutas internas bajo esa base:
  - Inicio (por defecto): `/certification-tests-web` o `/certification-tests-web/home`
  - Examen: `/certification-tests-web/quiz`
  - Resultados: `/certification-tests-web/results`

Scripts útiles:
- `npm run build:gh-pages` ? compila con `--base-href=/certification-tests-web/`
- `npm run deploy:gh-pages` ? publica el contenido de `dist/certification-tests-web/browser` en GitHub Pages

Notas:
- En local (ng serve) la app responde en la raíz (`/`), pero en producción (GitHub Pages) todas las rutas cuelgan de `/certification-tests-web`.
