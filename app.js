/* ============================================================
   Cola AV2 — Algoritmos de Ordenação
   App de revisão: explicações + visualizador passo a passo.
   Vanilla JS, sem build. Funciona em GitHub Pages.
   ============================================================ */

/* ---------- helpers de identidade (para animação FLIP) ---------- */
// Cada valor vira { id, v } com id estável, para conseguirmos animar
// um mesmo elemento "deslizando" entre posições quando há troca.
function withIds(nums) { return nums.map((v, i) => ({ id: i, v })); }
function cloneSlot(o) { return o == null ? null : { id: o.id, v: o.v }; }
function snap(arr) { return arr.map(cloneSlot); }
// posições cujo id está no conjunto de "ordenados"
function sortedPositions(arr, sortedIds) {
  const out = [];
  arr.forEach((o, k) => { if (o && sortedIds.has(o.id)) out.push(k); });
  return out;
}
// duas disposições são "iguais" se cada posição tem o mesmo id (ou buraco)
function sameArrangement(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ia = a[i] ? a[i].id : null, ib = b[i] ? b[i].id : null;
    if (ia !== ib) return false;
  }
  return true;
}
// posições que mudaram em relação à disposição anterior
function diffPositions(arr, prev) {
  if (!prev) return [];
  const out = [];
  arr.forEach((s, i) => {
    const ia = s ? s.id : null, ip = prev[i] ? prev[i].id : null;
    if (ia !== ip) out.push(i);
  });
  return out;
}

/* ============================================================
   GERADORES DE PASSOS
   Cada gerador recebe um array de números e devolve uma lista
   de "snapshots". O renderizador apenas desenha cada snapshot,
   então Próximo / Anterior / Pular / Reiniciar ficam triviais.
   ============================================================ */

function bubbleSteps(nums) {
  const a = withIds(nums);
  const n = a.length;
  const steps = [];
  const sortedIds = new Set();
  let pass = 0;

  steps.push({ array: snap(a), caption: "Vetor inicial", sorted: [], pass: 0 });

  for (let i = n - 1; i >= 1; i--) {
    pass++;
    for (let j = 0; j < i; j++) {
      steps.push({
        array: snap(a), compare: [j, j + 1],
        sorted: sortedPositions(a, sortedIds),
        caption: `Compara ${a[j].v} e ${a[j + 1].v}`, pass
      });
      if (a[j].v > a[j + 1].v) {
        const left = a[j].v, right = a[j + 1].v;
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: snap(a), swap: [j, j + 1],
          sorted: sortedPositions(a, sortedIds),
          caption: `${left} × ${right} → troca`, pass
        });
      }
    }
    sortedIds.add(a[i].id);
    steps.push({
      array: snap(a), sorted: sortedPositions(a, sortedIds),
      caption: `Fim da passada ${pass} — ${a[i].v} fixado no lugar`, pass
    });
  }
  sortedIds.add(a[0].id);
  steps.push({
    array: snap(a), sorted: a.map((_, k) => k),
    caption: "Vetor ordenado!", pass, done: true
  });
  return steps;
}

function selectionSteps(nums) {
  const a = withIds(nums);
  const n = a.length;
  const steps = [];
  const sortedIds = new Set();

  steps.push({ array: snap(a), caption: "Vetor inicial", sorted: [], pass: 0 });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    steps.push({
      array: snap(a), min, cursor: i, sorted: sortedPositions(a, sortedIds),
      caption: `Passada ${i + 1}: procurando o menor a partir do índice ${i}`, pass: i + 1
    });
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: snap(a), min, cursor: j, sorted: sortedPositions(a, sortedIds),
        caption: `Compara ${a[j].v} com o menor atual (${a[min].v})`, pass: i + 1
      });
      if (a[j].v < a[min].v) {
        min = j;
        steps.push({
          array: snap(a), min, sorted: sortedPositions(a, sortedIds),
          caption: `Novo menor: ${a[min].v} (índice ${min})`, pass: i + 1
        });
      }
    }
    if (min !== i) {
      const vi = a[i].v, vm = a[min].v;
      [a[i], a[min]] = [a[min], a[i]];
      steps.push({
        array: snap(a), swap: [i, min], sorted: sortedPositions(a, sortedIds),
        caption: `Troca ${vm} ↔ ${vi} (posições ${i} e ${min})`, pass: i + 1
      });
    } else {
      steps.push({
        array: snap(a), sorted: sortedPositions(a, sortedIds),
        caption: `${a[i].v} já é o menor — sem troca`, pass: i + 1
      });
    }
    sortedIds.add(a[i].id);
  }
  sortedIds.add(a[n - 1].id);
  steps.push({
    array: snap(a), sorted: a.map((_, k) => k),
    caption: "Vetor ordenado!", done: true
  });
  return steps;
}

function insertionSteps(nums) {
  const a = withIds(nums);
  const n = a.length;
  const steps = [];

  steps.push({ array: snap(a), temp: null, caption: "Vetor inicial", pass: 0 });

  for (let i = 1; i < n; i++) {
    const temp = a[i];
    a[i] = null;                       // levanta o valor -> deixa um buraco
    steps.push({
      array: snap(a), temp: cloneSlot(temp), compare: [i],
      caption: `TEMP = ${temp.v} (guarda o índice ${i})`, pass: i
    });
    let j = i - 1;
    while (j >= 0 && a[j].v > temp.v) {
      a[j + 1] = a[j];                 // desliza para a direita
      a[j] = null;
      steps.push({
        array: snap(a), temp: cloneSlot(temp), compare: [j],
        caption: `${a[j + 1].v} > ${temp.v}: desloca para a direita`, pass: i
      });
      j--;
    }
    a[j + 1] = temp;                   // insere o TEMP no lugar certo
    steps.push({
      array: snap(a), temp: null, compare: [j + 1],
      caption: `Insere ${temp.v} na posição ${j + 1}`, pass: i
    });
  }
  steps.push({
    array: snap(a), temp: null, sorted: a.map((_, k) => k),
    caption: "Vetor ordenado!", done: true
  });
  return steps;
}

function quickSteps(nums) {
  const a = withIds(nums);
  const steps = [];
  const sortedIds = new Set();

  function push(extra) {
    steps.push(Object.assign({
      array: snap(a),
      sorted: sortedPositions(a, sortedIds)
    }, extra));
  }

  push({ caption: "Vetor inicial", pass: 0 });

  // Partição idêntica à dos slides: pivô = primeiro elemento (esq).
  function particao(esq, dir, depth) {
    const pivoId = a[esq].id;
    const pivoVal = a[esq].v;
    const posOf = () => a.findIndex(o => o.id === pivoId);
    push({ partition: [esq, dir], pivot: posOf(), caption: `Pivô = ${pivoVal} • particionando [${esq}…${dir}]`, pass: depth });

    let posPivo = esq;
    for (let i = esq + 1; i <= dir; i++) {
      push({ partition: [esq, dir], pivot: posOf(), compare: [i], caption: `${a[i].v} ${a[i].v < pivoVal ? "<" : "≥"} ${pivoVal} (pivô)`, pass: depth });
      if (a[i].v < pivoVal) {
        const moved = a[i];
        for (let j = i - 1; j >= posPivo; j--) a[j + 1] = a[j];
        a[posPivo] = moved;            // rotaciona o menor para antes do pivô
        posPivo++;
        push({ partition: [esq, dir], pivot: posOf(), swap: [posPivo - 1], caption: `${moved.v} vai para a esquerda do pivô`, pass: depth });
      }
    }
    const finalPos = posOf();
    sortedIds.add(pivoId);
    push({ partition: [esq, dir], sorted: sortedPositions(a, sortedIds), caption: `Pivô ${pivoVal} na posição final (${finalPos})`, pass: depth });
    return finalPos;
  }

  function qs(esq, dir, depth) {
    if (esq > dir) return;
    if (esq === dir) {                 // partição de 1 elemento já está ordenada
      sortedIds.add(a[esq].id);
      push({ sorted: sortedPositions(a, sortedIds), caption: `[${esq}] tem 1 elemento — já ordenado`, pass: depth });
      return;
    }
    const q = particao(esq, dir, depth);
    qs(esq, q - 1, depth + 1);
    qs(q + 1, dir, depth + 1);
  }

  qs(0, a.length - 1, 1);
  push({ sorted: a.map((_, k) => k), caption: "Vetor ordenado!", done: true });
  return steps;
}

function binarySteps(nums, target) {
  const sorted = [...nums].sort((x, y) => x - y);
  const a = withIds(sorted);
  const n = a.length;
  const steps = [];
  let lo = 0, hi = n - 1, iter = 0;

  steps.push({
    array: snap(a), lo, hi, caption: `Vetor ordenado. Procurando ${target}.`, pass: 0
  });

  while (lo <= hi) {
    iter++;
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      array: snap(a), lo, mid, hi,
      caption: `início=${lo}, meio=${mid}, fim=${hi} → meio vale ${a[mid].v}`, pass: iter
    });
    if (a[mid].v === target) {
      steps.push({
        array: snap(a), lo, mid, hi, foundAt: mid,
        caption: `${target} encontrado no índice ${mid}!`, pass: iter, done: true
      });
      return steps;
    } else if (a[mid].v < target) {
      steps.push({
        array: snap(a), lo, mid, hi, eliminate: [lo, mid],
        caption: `${a[mid].v} < ${target}: descarta a metade esquerda`, pass: iter
      });
      lo = mid + 1;
    } else {
      steps.push({
        array: snap(a), lo, mid, hi, eliminate: [mid, hi],
        caption: `${a[mid].v} > ${target}: descarta a metade direita`, pass: iter
      });
      hi = mid - 1;
    }
  }
  steps.push({
    array: snap(a), lo, hi, notFound: true,
    caption: `${target} não está no vetor.`, pass: iter, done: true
  });
  return steps;
}

/* ============================================================
   CONTEÚDO (explicações + código + exemplos)
   ============================================================ */

const C = (s) => s; // marcador, mantém o código como texto puro

const ALGOS = {
  bubble: {
    slug: "bubble", emoji: "🫧", title: "Bubble Sort",
    sub: "Ordenação bolha", cx: "O(n²)", mode: "sort",
    gen: bubbleSteps, defaultArray: [25, 48, 37, 12, 57, 86],
    blurb: `<p>Compara <b>pares de vizinhos</b> e troca quando estão fora de ordem. A cada passada completa, o maior valor "borbulha" até o fim do vetor.</p>
            <p>Repete o processo até o vetor estar ordenado. A cada passada, uma posição do fim já fica garantida.</p>
            <p class="note" style="color:var(--muted);font-size:.85rem">Metáfora: valores maiores são bolhas leves — sobem para o fim. Pior/médio caso <b>O(n²)</b>.</p>`,
    code: C(`void BubbleSort(int* vetor, int tamanho) {
    int aux;
    for (int i = tamanho-1; i >= 1; i--) {
        for (int j = 0; j < i; j++) {
            if (vetor[j] > vetor[j+1]) {
                aux = vetor[j];
                vetor[j] = vetor[j+1];
                vetor[j+1] = aux;
            }
        }
    }
}`)
  },

  insertion: {
    slug: "insertion", emoji: "📥", title: "Ordenação por Inserção",
    sub: "Insertion sort", cx: "O(n²)", mode: "insertion",
    gen: insertionSteps, defaultArray: [6, 5, 3, 1, 8, 7],
    blurb: `<p>Percorre da <b>esquerda para a direita</b>. A cada elemento, guarda-o em <b>TEMP</b> e procura seu lugar entre os elementos já ordenados à esquerda.</p>
            <p>Os maiores que o TEMP são <b>deslocados para a direita</b> até abrir o espaço certo; então o TEMP é inserido.</p>
            <p class="note" style="color:var(--muted);font-size:.85rem">Ótimo para vetores quase ordenados. Caso geral <b>O(n²)</b>.</p>`,
    code: C(`void InsertionSort(int* array, int length) {
    int i, j, temp;
    for (i = 1; i < length; i++) {
        temp = array[i];
        j = i - 1;
        while ((j >= 0) && (temp < array[j])) {
            array[j + 1] = array[j];
            j = j - 1;
        }
        array[j + 1] = temp;
    }
}`)
  },

  selection: {
    slug: "selection", emoji: "🎯", title: "Ordenação por Seleção",
    sub: "Selection sort", cx: "O(n²)", mode: "sort",
    gen: selectionSteps, defaultArray: [8, 5, 2, 6, 9, 3],
    blurb: `<p>A cada passada, <b>procura o menor valor</b> do trecho ainda não ordenado e o <b>troca</b> para a primeira posição livre.</p>
            <p>A parte esquerda do vetor vai ficando ordenada, uma posição por passada.</p>
            <p class="note" style="color:var(--muted);font-size:.85rem">Faz no máximo <b>n-1 trocas</b> (poucas trocas), mas sempre <b>O(n²)</b> comparações.</p>`,
    code: C(`void SelectionSort(int* num, int tam) {
    int i, j, min, aux;
    for (i = 0; i < (tam-1); i++) {
        min = i;
        for (j = (i+1); j < tam; j++) {
            if (num[j] < num[min])
                min = j;
        }
        if (i != min) {
            aux = num[i];
            num[i] = num[min];
            num[min] = aux;
        }
    }
}`)
  },

  quick: {
    slug: "quick", emoji: "⚡", title: "Quick Sort",
    sub: "Divisão e conquista", cx: "O(n log n)", mode: "sort",
    gen: quickSteps, defaultArray: [25, 57, 48, 37, 12, 92],
    blurb: `<p><b>Divisão e conquista.</b> Escolhe um <b>pivô</b> (aqui, o primeiro elemento) e <b>particiona</b>: menores à esquerda, maiores à direita.</p>
            <p>Após a partição, o pivô fica na sua <b>posição final</b>. Então o algoritmo se chama <b>recursivamente</b> em cada partição.</p>
            <p class="note" style="color:var(--muted);font-size:.85rem">Média <b>O(n log n)</b>, pior caso O(n²).</p>`,
    code: C(`void QuickSort2(int* vet, int esq, int dir) {
    if (esq < dir) {
        int q = particao(vet, esq, dir);
        QuickSort2(vet, esq, q - 1);
        QuickSort2(vet, q + 1, dir);
    }
}

int particao(int* vet, int esq, int dir) {
    int posPivo = esq;
    int i, j;
    for (i = esq + 1; i <= dir; i++) {
        if (vet[i] < vet[posPivo]) {
            int aux = vet[i];
            for (j = i - 1; j >= posPivo; j--)
                vet[j + 1] = vet[j];
            vet[posPivo] = aux;
            posPivo++;
        }
    }
    return posPivo;
}`)
  },

  binary: {
    slug: "binary", emoji: "🔍", title: "Busca Binária",
    sub: "Binary search", cx: "O(log n)", mode: "binary",
    gen: binarySteps, defaultArray: [3, 8, 12, 15, 21, 27, 33, 40],
    defaultTarget: 27,
    blurb: `<p>Funciona <b>somente em vetor ordenado</b>. Olha o elemento do <b>meio</b>:</p>
            <p>• se for o alvo, achou;<br>• se o alvo for <b>menor</b>, busca na metade <b>esquerda</b>;<br>• se for <b>maior</b>, na metade <b>direita</b>.</p>
            <p>A cada passo descarta <b>metade</b> dos elementos usando <b>início</b>, <b>meio</b> e <b>fim</b>.</p>
            <p class="note" style="color:var(--muted);font-size:.85rem">Muito rápida: <b>O(log n)</b>.</p>`,
    code: C(`int buscaBinaria(int* vet, int tam, int alvo) {
    int inicio = 0;
    int fim = tam - 1;
    while (inicio <= fim) {
        int meio = (inicio + fim) / 2;
        if (vet[meio] == alvo)
            return meio;          // encontrado
        else if (vet[meio] < alvo)
            inicio = meio + 1;    // busca à direita
        else
            fim = meio - 1;       // busca à esquerda
    }
    return -1;                    // não encontrado
}`)
  }
};

const HOME_CARDS = [
  { slug: "bubble", emoji: "🫧", title: "Bubble Sort", sub: "Ordenação bolha", badge: "O(n²)" },
  { slug: "insertion", emoji: "📥", title: "Inserção", sub: "Insertion sort", badge: "O(n²)" },
  { slug: "selection", emoji: "🎯", title: "Seleção", sub: "Selection sort", badge: "O(n²)" },
  { slug: "quick", emoji: "⚡", title: "Quick Sort", sub: "Divisão e conquista", badge: "O(n log n)" },
  { slug: "binary", emoji: "🔍", title: "Busca Binária", sub: "Binary search", badge: "O(log n)" },
  { slug: "simulados", emoji: "📝", title: "Simulados", sub: "Praticar + gabarito", badge: "2 provas" }
];

/* ============================================================
   SIMULADOS (questões + respostas)
   ============================================================ */

const SIMULADOS = {
  simulado: {
    title: "Simulado AV2",
    note: "9 questões de treino. As respostas das simulações foram calculadas para conferência.",
    questions: [
      {
        num: "1a", text: `Vetor ordenado <span class="vec">[3, 8, 12, 15, 21, 27, 33, 40, 45, 52]</span>. Simule a <b>busca binária</b> pelo valor <b>27</b>, mostrando início, meio e fim em cada etapa.`,
        ans: `<div class="step"><b>1)</b> início=0, meio=4 (21), fim=9 → 21 &lt; 27, vai à direita</div>
              <div class="step"><b>2)</b> início=5, meio=7 (40), fim=9 → 40 &gt; 27, vai à esquerda</div>
              <div class="step"><b>3)</b> início=5, meio=5 (27), fim=6 → <b>encontrado no índice 5</b></div>`
      },
      {
        num: "1b", text: `No mesmo vetor, simule a <b>busca binária</b> pelo valor <b>3</b>.`,
        ans: `<div class="step"><b>1)</b> início=0, meio=4 (21), fim=9 → 21 &gt; 3, vai à esquerda</div>
              <div class="step"><b>2)</b> início=0, meio=1 (8), fim=3 → 8 &gt; 3, vai à esquerda</div>
              <div class="step"><b>3)</b> início=0, meio=0 (3), fim=0 → <b>encontrado no índice 0</b></div>`
      },
      {
        num: "2", text: `Aplique <b>ordenação por inserção</b> em <span class="vec">[9, 5, 1, 4, 3]</span>, mostrando o vetor após cada inserção.`,
        ans: `<div class="step">Inicial: [9, 5, 1, 4, 3]</div>
              <div class="step">Iter 1: [5, 9, 1, 4, 3]</div>
              <div class="step">Iter 2: [1, 5, 9, 4, 3]</div>
              <div class="step">Iter 3: [1, 4, 5, 9, 3]</div>
              <div class="step">Iter 4: [1, 3, 4, 5, 9]</div>`
      },
      {
        num: "3", text: `Aplique <b>ordenação por seleção</b> em <span class="vec">[9, 5, 1, 4, 3]</span>, mostrando o menor encontrado e a troca a cada iteração.`,
        ans: `<div class="step">Inicial: [9, 5, 1, 4, 3]</div>
              <div class="step">Iter 1: menor=1 → troca 9↔1 → [1, 5, 9, 4, 3]</div>
              <div class="step">Iter 2: menor=3 → troca 5↔3 → [1, 3, 9, 4, 5]</div>
              <div class="step">Iter 3: menor=4 → troca 9↔4 → [1, 3, 4, 9, 5]</div>
              <div class="step">Iter 4: menor=5 → troca 9↔5 → [1, 3, 4, 5, 9]</div>`
      },
      {
        num: "4", text: `Aplique <b>bubble sort</b> em <span class="vec">[6, 3, 8, 2, 7]</span>, mostrando o vetor após cada passada completa ("varredura").`,
        ans: `<div class="step">Inicial: [6, 3, 8, 2, 7]</div>
              <div class="step">Após passada 1: [3, 6, 2, 7, 8]</div>
              <div class="step">Após passada 2: [3, 2, 6, 7, 8]</div>
              <div class="step">Após passada 3: [2, 3, 6, 7, 8]</div>
              <div class="step">Após passada 4: [2, 3, 6, 7, 8]</div>`
      },
      {
        num: "5", text: `Programa em C: lê 10 inteiros <b>em ordem crescente</b>, implementa uma função de <b>busca binária</b> e informa a posição do valor procurado (ou que não foi encontrado).`,
        ans: `Veja o código completo na página <span class="link-inline" data-go="binary">Busca Binária ↗</span>. Estrutura: ler vetor com <code>scanf</code> num laço, chamar <code>buscaBinaria(vet, 10, alvo)</code> e imprimir a posição (ou -1).`
      },
      {
        num: "6", text: `Programa em C: lê 8 inteiros e ordena com <b>insertion sort</b>, mostrando o vetor ordenado ao final.`,
        ans: `Use a função da página <span class="link-inline" data-go="insertion">Inserção ↗</span> com <code>length = 8</code> e imprima o vetor no final.`
      },
      {
        num: "7", text: `Programa em C: lê 7 inteiros e ordena com <b>selection sort</b>.`,
        ans: `Use a função da página <span class="link-inline" data-go="selection">Seleção ↗</span> com <code>tam = 7</code>.`
      },
      {
        num: "8", text: `Refaça a questão 7, mas com <b>Bubble Sort</b>.`,
        ans: `Use a função da página <span class="link-inline" data-go="bubble">Bubble Sort ↗</span> com <code>tamanho = 7</code>.`
      },
      {
        num: "9", text: `Refaça a questão 7, mas com <b>Quick Sort</b>.`,
        ans: `Use as funções <code>QuickSort2</code> e <code>particao</code> da página <span class="link-inline" data-go="quick">Quick Sort ↗</span>, chamando <code>QuickSort2(vet, 0, 6)</code>.`
      }
    ]
  },

  avaliacao: {
    title: "Avaliação 2 (oficial)",
    note: "Prova com gabarito do professor.",
    questions: [
      {
        num: "1", text: `<b>Inserção</b> em <span class="vec">[9, 5, 1, 4, 3]</span>, estado do vetor após cada iteração.`,
        ans: `<div class="step">Vetor inicial: [9, 5, 1, 4, 3]</div>
              <div class="step">Iteração 1: [5, 9, 1, 4, 3]</div>
              <div class="step">Iteração 2: [1, 5, 9, 4, 3]</div>
              <div class="step">Iteração 3: [1, 4, 5, 9, 3]</div>
              <div class="step">Iteração 4: [1, 3, 4, 5, 9]</div>`
      },
      {
        num: "2", text: `<b>Seleção</b> em <span class="vec">[9, 5, 1, 4, 3]</span>, menor elemento e troca a cada iteração.`,
        ans: `<div class="step"><b>Iter 1:</b> menor=1 (índ. 2) → troca 9(0)↔1(2) → [1, 5, 9, 4, 3]</div>
              <div class="step"><b>Iter 2:</b> menor=3 (índ. 4) → troca 5(1)↔3(4) → [1, 3, 9, 4, 5]</div>
              <div class="step"><b>Iter 3:</b> menor=4 (índ. 3) → troca 9(2)↔4(3) → [1, 3, 4, 9, 5]</div>
              <div class="step"><b>Iter 4:</b> menor=5 (índ. 4) → troca 9(3)↔5(4) → [1, 3, 4, 5, 9]</div>
              <div class="note">A última posição já fica garantida como o maior elemento.</div>`
      },
      {
        num: "3", text: `<b>QuickSort</b> com o <b>primeiro elemento como pivô</b>: mostre o vetor após a 1ª partição de <span class="vec">[7, 4, 9, 3, 10, 5, 1, 11]</span>.`,
        ans: `<div class="step">Pivô escolhido: <b>7</b> (primeiro elemento).</div>
              <div class="step">Após a 1ª partição: [<b>4, 3, 5, 1</b>, <b>7</b>, <b>9, 10, 11</b>]</div>
              <div class="note">Menores que 7 à esquerda (mantendo a ordem relativa), pivô no meio, maiores à direita.</div>`
      },
      {
        num: "4", text: `Explique como funciona o <b>QuickSort</b> (papel do pivô, partição e recursividade).`,
        ans: `<div class="note"><b>Ideia geral:</b> divisão e conquista — escolhe um pivô, particiona em menores e maiores que o pivô, e aplica o mesmo processo recursivamente em cada parte.</div>
              <div class="note" style="margin-top:6px"><b>Pivô:</b> referência para dividir. Após a partição, ele fica na sua <b>posição final</b> (tudo à esquerda é menor, tudo à direita é maior).</div>
              <div class="note" style="margin-top:6px"><b>Partição:</b> percorre o vetor comparando cada elemento com o pivô; menores vão para a esquerda, maiores para a direita; o pivô fica entre as duas regiões.</div>
              <div class="note" style="margin-top:6px"><b>Recursividade:</b> repete para o subvetor da esquerda e o da direita, até subvetores de tamanho 0 ou 1 (já ordenados).</div>`
      },
      {
        num: "5", text: `Programa em C: lê 10 inteiros e ordena com <b>Bubble Sort</b>, mostrando o vetor ordenado.`,
        ans: `<pre class="code" style="margin-top:6px">#include &lt;stdio.h&gt;

int main() {
    int vet[10];
    int i, j, temp;

    for (i = 0; i &lt; 10; i++) {
        printf("Digite o %do numero: ", i + 1);
        scanf("%d", &amp;vet[i]);
    }

    for (i = 0; i &lt; 10 - 1; i++) {
        for (j = 0; j &lt; 10 - i - 1; j++) {
            if (vet[j] &gt; vet[j + 1]) {
                temp = vet[j];
                vet[j] = vet[j + 1];
                vet[j + 1] = temp;
            }
        }
    }

    printf("Vetor ordenado: ");
    for (i = 0; i &lt; 10; i++) printf("%d ", vet[i]);
    printf("\\n");
    return 0;
}</pre>`
      }
    ]
  }
};

/* ============================================================
   RENDERIZADOR / VISUALIZADOR (com animação FLIP)
   ============================================================ */

function Visualizer(root, algo) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let steps = [];
  let idx = 0;
  let timer = null;
  let lastLineCount = 0;       // nº de linhas do log no último render (p/ animar só linhas novas)
  const cellEls = new Map();   // id -> elemento .cell

  // --- DOM ---
  root.innerHTML = `
    <div class="viz">
      ${algo.mode === "insertion" ? `
      <div class="temp-zone">
        <span class="temp-label">TEMP</span>
        <div class="temp-slot" id="tempSlot"></div>
      </div>` : ""}
      <div class="cells-wrap${algo.mode === "binary" ? "" : " log"}">
        ${algo.mode === "binary"
          ? `<div class="cells" id="cells"></div><div class="markers" id="markers"></div>`
          : `<div class="cells-log" id="cellsLog"></div>`}
      </div>
      <div class="caption" id="caption"></div>
      <div class="passinfo" id="passinfo"></div>
      <div class="controls">
        <button class="ctrl" id="btnReset"><span class="ico">⟲</span>Reiniciar</button>
        <button class="ctrl" id="btnPrev"><span class="ico">◀</span>Anterior</button>
        <button class="ctrl primary" id="btnPlay"><span class="ico">▶</span>Play</button>
        <button class="ctrl" id="btnNext"><span class="ico">▶</span>Próximo</button>
        <button class="ctrl" id="btnEnd"><span class="ico">⏭</span>Fim</button>
      </div>
      <button class="ctrl test-toggle" id="btnCustom">Testar com seus próprios números</button>
      <div class="array-input" id="arrayInput" hidden>
        <label>Teste com seus próprios números:</label>
        <input id="arrInput" inputmode="numeric" value="${algo.defaultArray.join(", ")}" />
        ${algo.mode === "binary" ? `<input id="tgtInput" class="small" inputmode="numeric" value="${algo.defaultTarget}" aria-label="valor procurado" />` : ""}
        <button class="apply" id="btnApply">Aplicar</button>
        ${algo.mode === "binary" ? `<p class="hint">Os números são ordenados automaticamente. O segundo campo é o valor procurado.</p>` : ""}
      </div>
    </div>`;

  const $ = (id) => root.querySelector("#" + id);
  // modos de ordenação usam o "log" (uma linha nova por passo);
  // a busca binária continua numa única linha com os marcadores.
  const logMode = algo.mode !== "binary";
  const cellsBox = logMode ? null : $("cells");
  const logBox = logMode ? $("cellsLog") : null;
  const tempSlot = algo.mode === "insertion" ? $("tempSlot") : null;
  const markersBox = algo.mode === "binary" ? $("markers") : null;

  function getCell(id, value) {
    let el = cellEls.get(id);
    if (!el) {
      el = document.createElement("div");
      el.innerHTML = `<div class="box"></div><div class="idx"></div>`;
      cellEls.set(id, el);
    }
    el.className = "cell";          // reseta estados a cada render (células são reusadas)
    el.querySelector(".box").textContent = value;
    return el;
  }

  function layout(step) {
    const arr = step.array;
    // posição de cada id presente neste passo (na ordem do array)
    arr.forEach((slot, k) => {
      if (slot) { const el = getCell(slot.id, slot.v); el.querySelector(".idx").textContent = k; }
    });

    // monta a linha de células na ordem certa (com buracos)
    cellsBox.innerHTML = "";
    arr.forEach((slot) => {
      if (slot) cellsBox.appendChild(cellEls.get(slot.id));
      else {
        const hole = document.createElement("div");
        hole.className = "cell hole";
        hole.innerHTML = `<div class="box"></div><div class="idx"></div>`;
        cellsBox.appendChild(hole);
      }
    });

    // TEMP (inserção)
    if (tempSlot) {
      tempSlot.innerHTML = "";
      if (step.temp) {
        const el = getCell(step.temp.id, step.temp.v);
        el.querySelector(".idx").textContent = "";
        tempSlot.appendChild(el);
      }
    }

    // classes de estado (por posição)
    const slots = [...cellsBox.children];
    const setCls = (i, cls) => { if (i != null && slots[i]) slots[i].classList.add(cls); };
    (step.sorted || []).forEach(i => setCls(i, "sorted"));
    (step.compare || []).forEach(i => setCls(i, "compare"));
    (step.swap || []).forEach(i => setCls(i, "swap"));
    if (step.pivot != null) setCls(step.pivot, "pivot");
    if (step.min != null) setCls(step.min, "min");
    if (step.cursor != null) setCls(step.cursor, "cursor");

    // busca binária: descarte + marcadores
    if (algo.mode === "binary") {
      if (step.eliminate) {
        const [a, b] = step.eliminate;
        for (let i = a; i <= b; i++) if (i !== step.mid) setCls(i, "eliminated");
      }
      // descarta tudo fora de [lo..hi] para reforçar a metade ativa
      slots.forEach((s, i) => {
        if (step.lo != null && step.hi != null && (i < step.lo || i > step.hi)) s.classList.add("eliminated");
      });
      if (step.mid != null) setCls(step.mid, "compare");
      if (step.foundAt != null) setCls(step.foundAt, "found");

      markersBox.innerHTML = "";
      arr.forEach((_, i) => {
        const m = document.createElement("div");
        m.className = "marker";
        let html = "";
        if (i === step.lo) html += `<span class="m-ini">▲ início</span>`;
        if (i === step.mid) html += `<span class="m-meio">▲ meio</span>`;
        if (i === step.hi) html += `<span class="m-fim">▲ fim</span>`;
        m.innerHTML = html;
        markersBox.appendChild(m);
      });
    }
  }

  // monta UMA linha do log. `changed` = posições que mudaram em relação à
  // linha anterior (sempre destacadas, em cor própria, para ver o que mudou).
  // Os destaques "ao vivo" (compara/troca/pivô/...) só vão na linha ativa.
  function buildRow(step, active, changed) {
    const row = document.createElement("div");
    row.className = "cells-row" + (active ? " active" : "");
    step.array.forEach((slot, k) => {
      const cell = document.createElement("div");
      if (slot) {
        cell.className = "cell";
        cell.dataset.id = slot.id;
        cell.innerHTML = `<div class="box">${slot.v}</div><div class="idx">${k}</div>`;
      } else {
        cell.className = "cell hole";
        cell.innerHTML = `<div class="box"></div><div class="idx">${k}</div>`;
      }
      row.appendChild(cell);
    });
    const cells = [...row.children];
    const setCls = (i, cls) => { if (i != null && cells[i]) cells[i].classList.add(cls); };
    // o que mudou nesta linha (não marca buracos)
    (changed || []).forEach(i => { if (cells[i] && !cells[i].classList.contains("hole")) setCls(i, "changed"); });
    (step.sorted || []).forEach(i => setCls(i, "sorted"));
    if (active) {
      (step.compare || []).forEach(i => setCls(i, "compare"));
      (step.swap || []).forEach(i => setCls(i, "swap"));
      if (step.pivot != null) setCls(step.pivot, "pivot");
      if (step.min != null) setCls(step.min, "min");
      if (step.cursor != null) setCls(step.cursor, "cursor");
    }
    return row;
  }

  function renderLog(animate) {
    // agrupa os passos em "linhas": uma linha nova só quando a DISPOSIÇÃO
    // muda (uma troca/movimento). Comparações ficam na mesma linha.
    const lines = [];
    for (let k = 0; k <= idx; k++) {
      if (k === 0 || !sameArrangement(steps[k].array, steps[k - 1].array)) lines.push({ start: k, end: k });
      else lines[lines.length - 1].end = k;
    }

    logBox.innerHTML = "";
    const rows = [];
    lines.forEach((ln, L) => {
      const active = L === lines.length - 1;
      const repStep = active ? steps[idx] : steps[ln.end];
      const prevArr = L > 0 ? steps[lines[L - 1].start].array : null;
      const r = buildRow(repStep, active, diffPositions(repStep.array, prevArr));
      logBox.appendChild(r);
      rows.push(r);
    });

    // TEMP (inserção) — reflete o passo atual
    if (tempSlot) {
      tempSlot.innerHTML = "";
      const step = steps[idx];
      if (step.temp) tempSlot.innerHTML = `<div class="cell"><div class="box">${step.temp.v}</div><div class="idx"></div></div>`;
    }

    const lastRow = rows[rows.length - 1];
    lastRow.scrollIntoView({ block: "nearest", inline: "nearest" });

    // FLIP só quando uma linha NOVA surge (mudança real). Comparações não
    // criam linha — só atualizam destaques, sem deslizar. O transform vai
    // na .cell, então o "pop" da troca (na .box) compõe sem ser sobrescrito.
    const grew = lines.length > lastLineCount;
    if (animate && !reduceMotion && grew && rows.length > 1) {
      const prevById = new Map();
      [...rows[rows.length - 2].children].forEach(c => {
        if (c.dataset.id) prevById.set(c.dataset.id, c.getBoundingClientRect());
      });
      [...lastRow.children].forEach(c => {
        const f = c.dataset.id ? prevById.get(c.dataset.id) : null;
        if (!f) return;
        const l = c.getBoundingClientRect();
        const dx = f.left - l.left, dy = f.top - l.top;
        if (dx || dy) {
          c.style.transition = "none";
          c.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            c.style.transition = "transform .35s cubic-bezier(.22,.61,.36,1)";
            c.style.transform = "";
          });
        }
      });
    }
    lastLineCount = lines.length;
  }

  function render(animate) {
    const step = steps[idx];

    if (logMode) {
      renderLog(animate);
    } else {
      // busca binária: vetor não reordena, basta desenhar (sem FLIP)
      layout(step);
    }

    $("caption").textContent = step.caption;
    $("passinfo").textContent = `Passo ${idx + 1} de ${steps.length}` +
      (step.pass ? ` • ${algo.mode === "binary" ? "iteração" : "passada"} ${step.pass}` : "");
    $("btnPrev").disabled = idx === 0;
    $("btnNext").disabled = idx === steps.length - 1;
    $("btnEnd").disabled = idx === steps.length - 1;
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    const b = $("btnPlay");
    b.querySelector(".ico").textContent = "▶";
    b.childNodes[1].nodeValue = "Play";
  }
  function play() {
    if (timer) { stop(); return; }
    if (idx === steps.length - 1) { idx = 0; render(false); }
    const b = $("btnPlay");
    b.querySelector(".ico").textContent = "⏸";
    b.childNodes[1].nodeValue = "Pausar";
    timer = setInterval(() => {
      if (idx >= steps.length - 1) { stop(); return; }
      idx++; render(true);
    }, 950);
  }

  function build() {
    cellEls.clear();
    let nums = parseNums($("arrInput").value, algo.defaultArray);
    if (nums.length < 2) nums = algo.defaultArray.slice();
    if (nums.length > 14) nums = nums.slice(0, 14);
    if (algo.mode === "binary") {
      const t = parseInt($("tgtInput").value, 10);
      steps = binarySteps(nums, Number.isFinite(t) ? t : algo.defaultTarget);
    } else {
      steps = algo.gen(nums);
    }
    idx = 0;
    render(false);
  }

  // eventos
  $("btnNext").onclick = () => { stop(); if (idx < steps.length - 1) { idx++; render(true); } };
  $("btnPrev").onclick = () => { stop(); if (idx > 0) { idx--; render(true); } };
  $("btnEnd").onclick = () => { stop(); idx = steps.length - 1; render(true); };
  $("btnReset").onclick = () => { stop(); cellEls.clear(); idx = 0; render(false); };
  $("btnPlay").onclick = () => play();
  $("btnApply").onclick = () => { stop(); build(); };
  $("btnCustom").onclick = () => { $("arrayInput").hidden = false; $("btnCustom").hidden = true; $("arrInput").focus(); };
  $("arrInput").addEventListener("keydown", e => { if (e.key === "Enter") { stop(); build(); } });

  build();
  return { destroy: stop };
}

function parseNums(str, fallback) {
  const nums = (str || "")
    .split(/[,\s]+/)
    .map(s => parseInt(s, 10))
    .filter(n => Number.isFinite(n));
  return nums.length ? nums : fallback.slice();
}

/* ============================================================
   PÁGINAS / ROTEAMENTO
   ============================================================ */

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const topbarTitle = document.getElementById("topbarTitle");
let activeViz = null;

function escapeHTMLcode(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function highlightCode(code) {
  // realce leve: palavras-chave + comentários
  let h = escapeHTMLcode(code);
  h = h.replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>');
  h = h.replace(/\b(void|int|for|while|if|else|return)\b/g, '<span class="kw">$1</span>');
  return h;
}

function renderHome() {
  topbarTitle.textContent = "Cola AV2";
  backBtn.hidden = true;
  app.innerHTML = `
    <div class="grid">
      ${HOME_CARDS.map(c => `
        <button class="card" data-go="${c.slug}">
          <span class="card-title">${c.title}</span>
          <span class="badge">${c.badge}</span>
        </button>`).join("")}
    </div>`;
}

function renderAlgo(slug) {
  const algo = ALGOS[slug];
  topbarTitle.textContent = algo.title;
  backBtn.hidden = false;
  app.innerHTML = `
    <div class="page-head">
      <h2>${algo.title}</h2>
      <span class="cx">${algo.cx}</span>
    </div>

    <div class="section">
      <div class="panel"><div id="vizRoot"></div></div>
    </div>

    <div class="section">
      <div class="panel blurb">${algo.blurb}</div>
    </div>

    <div class="section">
      <details class="code-reveal">
        <summary>Código <span class="chev">▸</span></summary>
        <pre class="code">${highlightCode(algo.code)}</pre>
      </details>
    </div>`;
  activeViz = Visualizer(app.querySelector("#vizRoot"), algo);
}

function renderSimulados() {
  topbarTitle.textContent = "Simulados";
  backBtn.hidden = false;
  const renderSet = (key) => {
    const s = SIMULADOS[key];
    return `
      <p class="intro">${s.note}</p>
      ${s.questions.map(q => `
        <div class="q">
          <div class="q-num">Questão ${q.num}</div>
          <div class="q-text">${q.text}</div>
          <details class="reveal">
            <summary>Ver resposta</summary>
            <div class="ans">${q.ans}</div>
          </details>
        </div>`).join("")}`;
  };

  app.innerHTML = `
    <div class="sim-tabs">
      <button class="sim-tab active" data-sim="simulado">Simulado</button>
      <button class="sim-tab" data-sim="avaliacao">Avaliação 2</button>
    </div>
    <div id="simBody">${renderSet("simulado")}</div>`;

  app.querySelectorAll(".sim-tab").forEach(tab => {
    tab.onclick = () => {
      app.querySelectorAll(".sim-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      app.querySelector("#simBody").innerHTML = renderSet(tab.dataset.sim);
    };
  });
}

function route() {
  if (activeViz) { activeViz.destroy(); activeViz = null; }
  const hash = location.hash.replace(/^#\/?/, "");
  window.scrollTo(0, 0);
  if (ALGOS[hash]) renderAlgo(hash);
  else if (hash === "simulados") renderSimulados();
  else renderHome();
}

// navegação por delegação (cards e links internos)
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-go]");
  if (target) { location.hash = "#/" + target.dataset.go; }
});
backBtn.addEventListener("click", () => { location.hash = ""; });
window.addEventListener("hashchange", route);

route();
