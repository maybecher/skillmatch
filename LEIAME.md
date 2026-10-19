# SkillMatch: jogo vocacional da seletiva SP Skills 2028

Abra `index.html` no navegador para jogar. Todo o conteúdo editável está em `dados.js`.

| Arquivo | Para que serve |
|---|---|
| `index.html`, `script.js`, `jogo.css` | O jogo, em formato de stories (estilo retrospectiva do Spotify) |
| `dados.js` | Configurações, modalidades, perguntas e duelos |
| `marca.js`, `assets/` | Símbolo, brasão e padronagem do Team 1.01 (cópias leves das imagens do projeto team101) |
| `painel.html`, `style.css` | Painel da coordenação: quantos jogaram e quais modalidades saíram mais |
| `apps-script.gs` | Código que grava os resultados numa Planilha Google |
| `perguntas-jogo-vocacional.xlsx` | Planilha original das perguntas. Ainda **não** tem os duelos novos |

## Como o jogo funciona

O visual segue a identidade do site do Team 1.01: azul-marinho e dourado, fontes Montserrat e Inria Serif, o símbolo 1.01 e a padronagem em escada. Cada tela é um "story" com cor própria, e o resultado é uma sequência de slides que avançam sozinhos: ritmo de resposta, top 5, revelação da modalidade nº 1, perfil, idade, como é a prova e o resumo com o card. No resultado, toque à direita para avançar, à esquerda para voltar e segure para pausar.

- O aluno informa o primeiro nome e o ano de nascimento. A lista de modalidades já mostra em quais ele está dentro da idade-limite.
- São 12 perguntas de 8 opções e 8 duelos "isso ou aquilo", intercalados. Cada modalidade aparece em 2 duelos, então nenhuma leva vantagem.
- Se as duas primeiras ficarem a 1 ponto ou menos uma da outra, aparece uma pergunta de desempate entre elas.
- O resultado mostra o card para o story, o aviso de idade e os links da prova. No fim, o aluno diz se o resultado combinou com ele.

## Registro dos resultados (Planilha Google)

Sem configurar nada, os resultados ficam guardados só no aparelho em que o jogo foi aberto. Isso serve para um computador fixo na escola: o `painel.html` aberto no mesmo computador mostra os dados.

Para juntar os resultados de todos os celulares:

1. Crie uma Planilha Google e abra **Extensões → Apps Script**.
2. Apague o conteúdo, cole o `apps-script.gs` e troque `CHAVE_PAINEL` por uma senha sua.
3. Clique em **Implantar → Nova implantação → App da Web**. Em "Executar como", escolha **Eu**; em "Quem pode acessar", escolha **Qualquer pessoa**.
4. Copie a URL gerada (termina em `/exec`) e cole em `registroUrl` no `dados.js`.
5. Abra o painel com a chave: `painel.html?chave=SUA_SENHA`.

O nome do aluno **não** é enviado, só a modalidade, a idade em 2028 e as respostas.

## Inscrição já preenchida (Google Forms)

1. No Google Forms, abra **⋮ → Gerar link pré-preenchido**.
2. Preencha o nome com `NOME` e escolha qualquer modalidade, depois clique em **Copiar link**.
3. No link, ache os trechos `entry.123456=NOME` e `entry.987654=...`.
4. No `dados.js`, preencha `formPrefill`: em `url`, coloque o começo do link até `viewform`; em `campoNome` e `campoModalidade`, coloque os `entry.…` correspondentes.

Se a modalidade for uma pergunta de múltipla escolha, as opções do formulário precisam ter **exatamente** os nomes usados em `dados.js` (ex.: "Desenvolvimento de Aplicativos Móveis").

Se o aluno estiver fora da idade da modalidade que ganhou, a inscrição vem preenchida com a modalidade mais próxima dentro da idade dele.

## Fotos, vídeos e depoimentos

Cada modalidade já tem uma foto oficial da prova, tirada do catálogo de modalidades da WorldSkills (`FOTOS` em `dados.js`). Ela aparece só na revelação do resultado, com crédito e link para a página da modalidade. A imagem é carregada direto do site da WorldSkills, sem cópia no repositório; sem internet, o espaço da foto some. Design de Produtos usa a foto de "Industrial Design Technology", que é o nome atual dessa modalidade na WorldSkills.

Cada modalidade em `dados.js` tem os campos `midia` e `depoimento`, hoje vazios (`null`). Sem eles, o resultado mostra um botão para buscar vídeos da prova no YouTube.

```js
midia: { tipo: "youtube", id: "CODIGO_DO_VIDEO", legenda: "Prova de Mecatrônica na WorldSkills 2024" },
// ou uma foto da escola, colocada numa pasta "fotos":
midia: { tipo: "imagem", src: "fotos/mecatronica.jpg", legenda: "Nossa equipe treinando" },

depoimento: { nome: "Ana Souza", info: "Mecatrônica · SP Skills 2024", texto: "…", foto: "fotos/ana.jpg" },
```

O código do vídeo é o que vem depois de `v=` no link do YouTube.

## Card para o story

O card mostra o endereço definido em `jogoUrl`. Se ele estiver vazio, mostra o endereço da página ou, quando o jogo é aberto como arquivo, "Faça o jogo vocacional na escola". Defina `jogoUrl` assim que o jogo estiver publicado.

## Teste com alunos (validação)

Peça a uns 20 alunos que joguem por `index.html?teste=1`. No modo teste, antes de começar, o aluno diz qual modalidade espera que dê. A seção "Validação" do painel mostra quantas vezes o resultado bateu. A coluna `respostas` da planilha registra cada escolha (ex.: `p3:mec d2:ctrl`), para achar respostas que estão "na cara" demais.
