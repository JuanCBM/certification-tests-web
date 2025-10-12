# Certification Tests (Angular)

Aplicaci�n Angular sencilla para practicar tests de certificaciones (ej. TOGAF 10) siguiendo buenas pr�cticas b�sicas: componentes standalone, servicios para l�gica, modelos tipados, routing y separaci�n de responsabilidades.

Caracter�sticas:
- Pantalla inicial con lista de certificaciones (incluye TOGAF 10 con 6 bloques y opci�n 7: Todos aleatorios).
- Configuraci�n del examen: subir archivo de preguntas en texto, elegir bloque (1?6 o Todos), n�mero de preguntas y modo de feedback (inmediato o al final).
- Ejecuci�n del test: navegaci�n por preguntas, feedback inmediato opcional.
- Resultados: puntuaci�n y revisi�n de respuestas correctas/incorrectas.

## Formato del archivo de preguntas
Archivo de texto plano. Reglas:
- Cada pregunta comienza con una l�nea que empieza por `Q:`.
- Opciones en l�neas separadas con prefijo `A)`, `B)`, `C)`, `D)` (u otras letras).
- Marca la opci�n correcta anteponiendo un `*` justo despu�s del par�ntesis, por ejemplo: `B) *Texto correcto`.
- Opcional: indica el bloque al que pertenecen con una l�nea `#BLOCK n` (n = 0..6). Si usas `#BLOCK 0` o no indicas bloque, la pregunta se considera "sin bloque" y entra en la opci�n "Todos".
- Las l�neas vac�as separan preguntas. Las l�neas que empiezan por `//` son comentarios.
- Puedes a�adir im�genes de referencia en medio de la pregunta usando etiquetas `<image>...</image>` con rutas bajo `assets/`, por ejemplo: `<image>assets/q5_image.png</image>`. Se soportan m�ltiples im�genes por pregunta.

Ejemplo: `src/assets/examples/togaf-sample.txt`.

```
#BLOCK 1
Q: TOGAF se define como un marco de trabajo para...
A) La gesti�n de proyectos
B) *El desarrollo y la gesti�n de arquitectura empresarial
C) La administraci�n de redes
D) El dise�o de bases de datos
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

## Buenas pr�cticas aplicadas
- Componentes standalone (Angular 17) para reducir boilerplate.
- Servicios inyectables para l�gica (parsing, estado del quiz).
- Modelos TypeScript para tipado fuerte.
- Ruteo claro y separaci�n de responsabilidades.
- UI m�nima accesible y responsive.

## Notas
- Si no indicas `#BLOCK`, las preguntas se consideran del conjunto general y entran en "Todos".
- El m�ximo de preguntas permitido se ajusta autom�ticamente al n�mero de preguntas disponibles del bloque elegido.
- Puedes preparar diferentes archivos por certificaci�n; la app no fuerza un esquema espec�fico de certificaci�n.

@JuanCBM

## Despliegue en GitHub Pages y URL p�blica
- Ruta base (base href) de la app: `/certification-tests-web`
- URL p�blica: https://juancbm.github.io/certification-tests-web/
- Rutas internas bajo esa base:
  - Inicio (por defecto): `/certification-tests-web` o `/certification-tests-web/home`
  - Examen: `/certification-tests-web/quiz`
  - Resultados: `/certification-tests-web/results`

Scripts �tiles:
- `npm run build:gh-pages` ? compila con `--base-href=/certification-tests-web/`
- `npm run deploy:gh-pages` ? publica el contenido de `dist/certification-tests-web/browser` en GitHub Pages

Notas:
- En local (ng serve) la app responde en la ra�z (`/`), pero en producci�n (GitHub Pages) todas las rutas cuelgan de `/certification-tests-web`.

### Soluci�n a 404 en GitHub Pages
Si ves "There isn't a GitHub Pages site here" o 404 en https://juancbm.github.io/certification-tests-web/:
1) Aseg�rate de que el workflow haya corrido y publicado a la rama `gh-pages` (Actions -> Deploy to GitHub Pages).  
2) En Settings -> Pages, selecciona como Source: "Deploy from a branch" y Branch: `gh-pages` (carpeta ra�z). Guarda.
3) Espera 1-2 minutos a que GitHub propague el deploy y recarga la URL.
4) Para rutas internas (deep links), el `src/404.html` redirige autom�ticamente a `index.html`.
