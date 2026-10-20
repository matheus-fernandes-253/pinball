# ⛩️ Nasty Pinball (悪戯ピンボール) - Guia do Projeto & Artes

> Pinball estilo arcade oriental retrô (1920×1080p) construído com **React**, **TypeScript**, **HTML5 Canvas**, **Web Audio API** e motor de física 2D sub-step.

---

## 🎯 Sumário Rápido
1. [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
2. [Guia de Troca de Artes (Para o Dev/Designer Júnior)](#-guia-de-troca-de-artes-para-o-devdesigner-júnior)
3. [Resoluções e Proporções Oficiais](#-resoluções-e-proporções-oficiais)
4. [Onde Fica Cada Coisa no Código](#-onde-fica-cada-coisa-no-código)
5. [Como Rodar o Projeto Localmente](#-como-rodar-o-projeto-localmente)
6. [Passo a Passo: Como Publicar e Atualizar no GitHub](#-passo-a-passo-como-publicar-e-atualizar-no-github)

---

## 📐 Visão Geral da Arquitetura

O jogo foi desenhado sob uma proporção widescreen fixa **1920×1080 (16:9)** dividida em duas colunas:
- **Coluna da Esquerda (58% de largura)**: A mesa mecânica vertical de pinball renderizada em Canvas 2D a 60 FPS com física contínua sub-step (sistema de coordenadas interno: **700px largura × 960px altura**).
- **Coluna da Direita (42% de largura)**: O painel iluminado do gabinete (*Backglass*), contendo a arte da heroína/mascote, medidor animado de pontuação para avanço de fase, Dot Matrix Display (DMD), alvos e o **Seletor de Fases (1 a 5)**.

---

## 🎨 Guia de Troca de Artes (Para o Dev/Designer Júnior)

Todas as imagens do jogo ficam localizadas na pasta:
```bash
/src/assets/images/
```

### Arquivos de Imagens Atuais:
| Arquivo Atual | Uso no Jogo | Onde Alterar no Código |
| :--- | :--- | :--- |
| `beach_anime_pixelart_1792443936790.jpg` | **Fase 1: Beach Bikini Arcade** (Mesa e Backglass) | `src/game/tableLayout.ts` no `STAGES[0]` |
| `jhorror_playfield_1792458808970.jpg` | **Fase 2: J-Horror School** (Fundo da Mesa) | `src/game/tableLayout.ts` no `STAGES[1]` |
| `jhorror_backglass_art_1792338949512.jpg` | **Fase 2: J-Horror School** (Backglass Reiko) | `src/game/tableLayout.ts` no `STAGES[1]` |
| `samurai_playfield_1792458810307.jpg` | **Fase 3: Samurai Sakura** (Fundo da Mesa) | `src/game/tableLayout.ts` no `STAGES[2]` |
| `samurai_backglass_art_1792338949761.jpg` | **Fase 3: Samurai Sakura** (Backglass Tomoe) | `src/game/tableLayout.ts` no `STAGES[2]` |
| `shinobi_playfield_1792458809537.jpg` | **Fase 4: Mecha Shinobi** (Fundo da Mesa) | `src/game/tableLayout.ts` no `STAGES[3]` |
| `shinobi_backglass_art_1792338951047.jpg` | **Fase 4: Mecha Shinobi** (Backglass Kasumi) | `src/game/tableLayout.ts` no `STAGES[3]` |
| `yokai_playfield_1792458809655.jpg` | **Fase 5: Yokai Oni** (Fundo da Mesa) | `src/game/tableLayout.ts` no `STAGES[4]` |
| `yokai_backglass_art_1792338965836.jpg` | **Fase 5: Yokai Oni** (Backglass Akane) | `src/game/tableLayout.ts` no `STAGES[4]` |

---

## 📏 Resoluções e Proporções Oficiais

### 1. Imagens do Backglass (Painel Lateral / Mascotes das Fases)
- **Proporção**: **1:1** (Quadrada)
- **Resolução Recomendada**: **1024 × 1024 px** (ou no mínimo **600 × 600 px**)
- **Formato ideal**: `.jpg`, `.png` ou `.webp`
- **Dica de Enquadramento**: Mantenha o rosto e o corpo principal da mascote centralizados verticalmente, pois a parte inferior tem uma faixa translúcida com o balão de fala dinâmico da personagem.

### 2. Imagem de Fundo da Mesa de Pinball (Playfield Decal)
- **Proporção**: **700 × 960 px** (proporção ~**14:19**, vertical tipo pôster)
- **Resolução Recomendada**: **1400 × 1920 px** (em alta densidade 2x) ou **700 × 960 px** (1x)
- **Formato ideal**: `.jpg` ou `.png`
- **Dica de Design**:
  - A bola é de aço prateado brilhante. Evite fundos 100% brancos no centro da mesa para manter o contraste da bola visível.
  - O topo da mesa possui uma curva (arco do pinball) e a lateral direita (largura de ~60px) é o trilho de lançamento da mola.

---

## 🛠️ Passo a Passo: Como Substituir uma Imagem

1. **Coloque o arquivo na pasta correta**:
   Copie sua nova imagem para `src/assets/images/` (exemplo: `minha_fase2_terror.png`).

2. **Vincule a imagem no código**:
   Abra `src/game/tableLayout.ts`, localize o array `STAGES` e troque o caminho da propriedade `backglassImage`:
   ```typescript
   {
     id: 2,
     name: 'STAGE 2: J-HORROR SCHOOL',
     // ...
     backglassImage: '/src/assets/images/minha_fase2_terror.png', // <-- coloque seu arquivo aqui
     // ...
   }
   ```

3. **Se for trocar a arte de fundo da mesa (Playfield)**:
   Abra `src/components/PinballCanvas.tsx` e altere a linha que carrega a imagem:
   ```typescript
   useEffect(() => {
     const img = new Image();
     img.src = '/src/assets/images/minha_nova_mesa.jpg'; // <-- seu arquivo aqui
     img.onload = () => {
       playfieldImgRef.current = img;
     };
   }, []);
   ```

4. **Customizar textos, mascote e falas da fase**:
   No mesmo arquivo `src/game/tableLayout.ts`, você pode trocar livremente:
   - `mascotName`: Nome exibido da garota.
   - `scoreThreshold`: Quantos pontos são necessários para passar de fase.
   - `dropTargetLetters`: As letras/kanjis dos alvos que caem.
   - `mascotQuotes`: Frases de início, combo, dreno e vitória.

---

## 💻 Como Rodar o Projeto Localmente

Certifique-se de ter o **Node.js** (versão 18 ou superior) instalado no computador.

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor de desenvolvimento local
npm run dev
```

Abra o navegador no endereço exibido no terminal (geralmente `http://localhost:3000` ou `http://localhost:5173`).

---

## 🚀 Passo a Passo: Como Publicar e Atualizar no GitHub

### Passo 1: Criar o Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Dê um nome ao repositório (exemplo: `nasty-pinball`).
3. Deixe o repositório como **Público** (ou Privado, conforme preferir).
4. **Não marque** as opções "Add a README file" ou "Add .gitignore" (o projeto já tem esses arquivos configurados!).
5. Clique em **"Create repository"**.
6. Copie a URL do seu repositório (ex: `https://github.com/SEU_USUARIO/nasty-pinball.git`).

---

### Passo 2: Publicar a Primeira Vez (No Terminal)

No terminal dentro da pasta do projeto, execute estes comandos em ordem:

```bash
# 1. Inicializa o Git no projeto
git init -b main

# 2. Adiciona todos os arquivos do projeto
git add .

# 3. Cria o primeiro commit
git commit -m "feat: versão inicial do Nasty Pinball com 5 fases e artes"

# 4. Conecta com o seu repositório do GitHub (troque pela URL que você copiou no Passo 1)
git remote add origin https://github.com/SEU_USUARIO/nasty-pinball.git

# 5. Envia os arquivos para o GitHub
git push -u origin main
```

---

### Passo 3: Rotina Diária (Como Atualizar Sempre Que Mexer no Jogo)

Sempre que você ou outro desenvolvedor trocar uma arte, mexer em cores ou criar uma fase nova:

```bash
# 1. Veja o que foi modificado
git status

# 2. Adicione os arquivos alterados
git add .

# 3. Grave uma mensagem explicando o que foi feito
git commit -m "feat: trocada a arte da fase 2 e ajustados os bumpers"

# 4. Envie as atualizações para o GitHub!
git push
```

Pronto! O GitHub estará sempre 100% atualizado com a última versão do jogo.

---

## 🕹️ Controles do Jogo

- **Z** ou **Seta Esquerda (←)** ou **A**: Flipper Esquerdo
- **/** ou **Seta Direita (→)** ou **D**: Flipper Direito
- **Espaço** ou **Seta Baixo (↓)**: Puxar e soltar a Mola do Lançador (Plunger)
- **X** ou **N**: Nudge / Empurrar a mesa (cuidado com o Sensor de Tilt!)
- **Teclas 1, 2, 3, 4, 5**: Atalho de teclado para alternar instantaneamente entre as 5 fases (ideal para validação e testes rápidos de arte)
- **ESC** ou **P**: Pausar / Continuar
