Para crear un archivo de instrucciones personalizadas para GitHub Copilot (`.github/copilot-instructions.md`) que le guíe en la generación de preguntas y respuestas con el formato específico solicitado, puedes usar el siguiente contenido:

### Contenido para `.github/copilot-instructions.md`

```markdown
# Generación de Preguntas de Examen

Cuando se te pida generar preguntas y respuestas para el cuestionario, debes seguir estrictamente este formato:

1. Cada pregunta debe comenzar con el prefijo `Q: ` seguido del texto de la pregunta.
2. Las opciones deben ser etiquetadas como `A)`, `B)`, `C)`, `D)`, etc.
3. Debes marcar la respuesta correcta (o respuestas correctas, si hay varias) colocando un asterisco `*` inmediatamente antes del texto de la opción, después del paréntesis.
4. Deja una línea en blanco entre cada bloque de pregunta y respuestas.

### Ejemplo de formato:

Q: Which options can be considered good prompt engineering principles?
A) *Provide examples
B) Be as ambiguous as you can
C) *Refine prompts from general to specific
D) Avoid experimenting

Q: What is the main goal of GitHub Copilot?
A) To replace developers
B) *To act as an AI pair programmer
C) To manage cloud infrastructure
D) To host git repositories
```

### Instrucciones Adicionales
*   **Contexto:** Si estás trabajando en un proyecto de certificación (como el archivo `gh300-sample.txt`), asegúrate de que las preguntas sigan la temática de GitHub Copilot y desarrollo de software.
*   **Multi-respuesta:** Si una pregunta admite varias respuestas correctas, marca todas las que correspondan con el asterisco `*`.
*   **Consistencia:** No añadidas explicaciones adicionales fuera del formato `Q:` y `A) B) C) D)` a menos que se te pida explícitamente.

---

### ¿Cómo aplicar esto?
Debes crear un archivo llamado `.github/copilot-instructions.md` en la raíz de tu proyecto con el contenido anterior. GitHub Copilot leerá automáticamente este archivo y aplicará estas reglas cuando interactúes con él en el chat o generes código en este repositorio.