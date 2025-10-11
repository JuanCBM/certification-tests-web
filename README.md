# Certification Tests (Angular)

Aplicación Angular sencilla para practicar tests de certificaciones (ej. TOGAF 10) siguiendo buenas prácticas básicas: componentes standalone, servicios para lógica, modelos tipados, routing y separación de responsabilidades.

Características:
- Pantalla inicial con lista de certificaciones (incluye TOGAF 10 con 6 bloques y opción 7: Todos aleatorios).
- Configuración del examen: subir archivo de preguntas en texto, elegir bloque (1?6 o Todos), número de preguntas y modo de feedback (inmediato o al final).
- Ejecución del test: navegación por preguntas, feedback inmediato opcional.
- Resultados: puntuación y revisión de respuestas correctas/incorrectas.

## Formato del archivo de preguntas
Archivo de texto plano. Reglas:
- Cada pregunta comienza con una línea que empieza por `Q:`.
- Opciones en líneas separadas con prefijo `A)`, `B)`, `C)`, `D)` (u otras letras).
- Marca la opción correcta anteponiendo un `*` justo después del paréntesis, por ejemplo: `B) *Texto correcto`.
- Opcional: indica el bloque al que pertenecen con una línea `#BLOCK n` (n = 1..6).
- Las líneas vacías separan preguntas. Las líneas que empiezan por `//` son comentarios.
- Puedes añadir imágenes de referencia en medio de la pregunta usando etiquetas `<image>...</image>` con rutas bajo `assets/`, por ejemplo: `<image>assets/q5_image.png</image>`. Se soportan múltiples imágenes por pregunta.

Ejemplo: `src/assets/examples/togaf-sample.txt`.

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
- `src/app/app.component.ts` Shell con router.[package.json](../coleccion-vinos-web/package.json)
- `src/app/app.routes.ts` Rutas: home, setup, quiz, results.[angular.json](../coleccion-vinos-web/angular.json)
- `src/app/models.ts` Modelos tipados.
- `src/app/services/question-parser.service.ts` Parser del archivo de preguntas.
- `src/app/services/quiz.service.ts` Estado y flujo del examen.
- `src/app/pages/*` Componentes de UI.

## Buenas prácticas aplicadas
- Componentes standalone (Angular 17) para reducir boilerplate.
- Servicios inyectables para lógica (parsing, estado del quiz).
- Modelos TypeScript para tipado fuerte.
- Ruteo claro y separación de responsabilidades.
- UI mínima accesible y responsive.

## Notas
- Si no indicas `#BLOCK`, las preguntas se consideran del conjunto general y entran en "Todos".
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

### Solución a 404 en GitHub Pages
Si ves "There isn't a GitHub Pages site here" o 404 en https://juancbm.github.io/certification-tests-web/:
1) Asegúrate de que el workflow haya corrido y publicado a la rama `gh-pages` (Actions -> Deploy to GitHub Pages).  
2) En Settings -> Pages, selecciona como Source: "Deploy from a branch" y Branch: `gh-pages` (carpeta raíz). Guarda.
3) Espera 1-2 minutos a que GitHub propague el deploy y recarga la URL.
4) Para rutas internas (deep links), el `src/404.html` redirige automáticamente a `index.html`.
