# Cola AV2 — Algoritmos de Ordenação

Cola de revisão (mobile-first, em português) para a prova de **Estrutura de Dados**.
Cobre **Bubble Sort, Inserção, Seleção, Quick Sort** e **Busca Binária**, com:

- explicação curta de cada método;
- **visualizador interativo passo a passo** (Reiniciar · Anterior · Play/Pausar · Próximo · Pular para o fim), com animação de troca/deslocamento e a possibilidade de testar seus próprios números;
- o **código em C** de cada algoritmo;
- os **2 simulados** (Simulado + Avaliação 2) com respostas em "tap-to-reveal" para você treinar.

É um site **estático** (HTML + CSS + JavaScript puro, sem dependências e sem build).

## Arquivos

| Arquivo | O quê |
|---|---|
| `index.html` | estrutura da página |
| `styles.css` | estilo (mobile-first) |
| `app.js` | conteúdo, geradores de passos e o visualizador |
| `.nojekyll` | evita o processamento Jekyll no GitHub Pages |

Os PDFs originais ficam no repositório apenas como referência — não são usados pelo site.

## Rodar localmente

Basta abrir o `index.html` no navegador. Para um servidor local:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `cola-av2`).
2. Suba estes arquivos para o branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Cola AV2"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/cola-av2.git
   git push -u origin main
   ```
3. No GitHub: **Settings → Pages → Build and deployment**
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` / `/ (root)` → **Save**
4. Aguarde ~1 minuto. O site fica em:
   `https://SEU_USUARIO.github.io/cola-av2/`

Pronto — abra esse link no celular e use como cola. 📱
