import os

file_path = r'src\assets\examples\test-ejercicios'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

header = [
    "// Sample questions file for GH-300\n",
    "// Use #BLOCK n to indicate domain, Q: for the question and A)/B)/C)/D) for options.\n",
    "// *Mark the correct answer with\n",
    "// Domains:\n",
    "// 1: Responsible AI (7%)\n",
    "// 2: GitHub Copilot plans and features (31%)\n",
    "// 3: How GitHub Copilot works and handles data (15%)\n",
    "// 4: Prompt Crafting and Prompt Engineering (9%)\n",
    "// 5: Developer use cases for AI (14%)\n",
    "// 6: Testing with GitHub Copilot (9%)\n",
    "// 7: Privacy fundamentals and context exclusions (15%)\n"
]

# Extraer todas las preguntas
questions = []
current_q = None

# Primero limpiamos el archivo de los bloques existentes para re-clasificar
content_lines = []
for line in lines:
    if line.startswith('//') or line.startswith('#BLOCK'):
        continue
    content_lines.append(line)

content = "".join(content_lines)
# Dividir por "Q: " pero teniendo cuidado con la primera pregunta
parts = content.split('Q: ')
for part in parts:
    part = part.strip()
    if not part:
        continue
    
    # Manejar el caso especial de la última pregunta mal formateada
    if "How does GitHub Copilot Enterprise enhance team testing workflows?" in part:
        q_text = "How does GitHub Copilot Enterprise enhance team testing workflows?\n"
        choices_raw = [
            "Through team testing improvements with collaborative code review providing supplementary workflow benefits",
            "Through workflow enhancement that combines collaborative features with code review for testing optimization",
            "Through collaborative techniques with code review being enhanced by team testing practice integration",
            "*Through collaborative code review techniques that improve team testing practices"
        ]
        letters = ["A) ", "B) ", "C) ", "D) "]
        for i, choice in enumerate(choices_raw):
            q_text += letters[i] + choice + "\n"
        questions.append(q_text.strip())
    else:
        questions.append(part)

# Clasificación
blocks = {i: [] for i in range(1, 8)}

for q in questions:
    q_lower = q.lower()
    # 1: Responsible AI
    if any(x in q_lower for x in ['responsible ai', 'harm', 'data bias', 'legal protection']):
        blocks[1].append(q)
    # 6: Testing
    elif any(x in q_lower for x in ['test', 'debugging', 'troubleshoot', 'edge case']):
        blocks[6].append(q)
    # 4: Prompt Engineering
    elif any(x in q_lower for x in ['prompting', 'prompt engineering', 'contextual information', 'essential components', 'zero-shot', 'few-shot', 'prompt process']):
        blocks[4].append(q)
    # 7: Privacy
    elif any(x in q_lower for x in ['privacy', 'exclusion', 'personal data', 'security policies']):
        blocks[7].append(q)
    # 3: How it works
    elif any(x in q_lower for x in ['processing pipeline', 'data handling', 'data flow', 'algorithms', 'how does github copilot generate']):
        blocks[3].append(q)
    # 2: Plans and features
    elif any(x in q_lower for x in ['subscription', 'tier', 'business', 'enterprise', 'status indicator', 'billing', 'knowledge base']):
        blocks[2].append(q)
    # 5: Developer use cases
    else:
        blocks[5].append(q)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(header)
    for i in range(1, 8):
        if blocks[i]:
            f.write(f"\n#BLOCK {i}\n\n")
            for q in blocks[i]:
                f.write(f"Q: {q}\n\n")
