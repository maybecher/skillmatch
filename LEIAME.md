# SkillMatch: jogo vocacional da seletiva SP Skills 2028

Abra `index.html` no navegador para jogar. Todo o conteúdo editável está em `dados.js`.

| Arquivo | Para que serve |
|---|---|
| `index.html`, `script.js`, `jogo.css` | O jogo, em formato de stories (estilo retrospectiva do Spotify) |
| `dados.js` | Configurações, modalidades, perguntas e duelos |
| `marca.js`, `assets/` | Símbolo, brasão e padronagem do Team 1.01 (cópias leves das imagens do projeto team101) |
| `painel.html`, `style.css` | Painel da coordenação: quantos jogaram e quais modalidades saíram mais |
| `apps-script.gs` | Código que grava os resultados numa Planilha Google |
| `perguntas-jogo-vocacional.xlsx` | Planilha original das perguntas. Está desatualizada: não tem os duelos nem as modalidades novas |

## Como o jogo funciona

O visual segue a identidade do site do Team 1.01: azul-marinho e dourado, fontes Montserrat e Inria Serif, o símbolo 1.01 e a padronagem em escada. Cada tela é um "story" com cor própria, e o resultado é uma sequência de slides que avançam sozinhos: ritmo de resposta, top 5, revelação da modalidade nº 1, perfil, idade, como é a prova e o resumo com o card. No resultado, toque à direita para avançar, à esquerda para voltar e segure para pausar.

- O aluno informa o primeiro nome e o ano de nascimento. A lista de modalidades já mostra em quais ele está dentro da idade-limite.
- São 13 modalidades: #01 Mecânica Industrial, #04 Mecatrônica, #05 Projeto de Engenharia Mecânica (CAD), #08 Desenvolvimento de Aplicativos Móveis, #17 Tech Web, #18 Instalações Elétricas, #19 Controle Industrial, #24 Movelaria, #25 Marcenaria de Estruturas, #48 Indústria 4.0, #50 3D Game Art, #52 Tecnologia Laboratorial Química e #59 Tecnologia em Design Industrial.
- Cada jogo tem 14 perguntas: 10 de múltipla escolha e 4 duelos "isso ou aquilo", espalhados entre elas. Quando as duas primeiras modalidades empatam, entra 1 pergunta extra de desempate, então o jogo tem no máximo 15. Cada pergunta de múltipla escolha tem uma resposta escrita para cada modalidade, mas mostra só 8 delas: entram as modalidades que apareceram menos até ali. Os 4 duelos são sorteados de um banco de 18 pelo mesmo critério. Assim, todas as modalidades aparecem de 6 a 8 vezes por jogo.
- As perguntas usam situações do dia a dia (trabalho em grupo, tempo livre, tarefa na escola, algo que não funciona) e cada resposta reflete o que a prova da modalidade realmente avalia, sem dizer o nome da área. A única pergunta mais direta, de propósito, é a da feira de profissões.
- A afinidade de cada modalidade é "das vezes em que ela apareceu, quantas o aluno escolheu". Contar as oportunidades evita que uma modalidade ganhe só por ter aparecido mais.
- Para incluir uma modalidade, escreva a resposta dela em todas as perguntas de múltipla escolha, coloque-a em pelo menos 2 duelos e adicione as fotos em `FOTOS`.
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

O aluno pode se inscrever em mais de uma modalidade. No fim do jogo, aparece o convite "Gostou do resultado? Se tiver interesse, inscreva-se nas modalidades do seu match que mais combinam com você", com o botão de inscrição. O formulário chega com o nome e a modalidade nº 1 do aluno (dentro da idade) já marcados, e ele inclui as outras que quiser. Para isso, a pergunta de modalidade deve ser de **caixas de seleção**, com opções **exatamente** iguais aos nomes usados em `dados.js` (ex.: "Desenvolvimento de Aplicativos Móveis").

## Fotos, vídeos e depoimentos

Cada modalidade tem 3 fotos da WorldSkills 2026 (Xangai), tiradas do [Flickr oficial da WorldSkills](https://www.flickr.com/photos/worldskills/collections/72157725408624379/) (`FOTOS` em `dados.js`). Elas passam em carrossel só na revelação do resultado, no tempo do story: se o aluno segura para pausar, o carrossel também para. As fotos têm licença CC BY-NC-ND 4.0 (uso não comercial, com crédito e sem alterar a imagem), por isso aparecem com o crédito e o link do álbum e são carregadas direto do Flickr, sem cópia no repositório. Sem internet, as fotos somem sem quebrar a tela. Tecnologia em Design Industrial usa o álbum de "Industrial Design Technology".

Cada modalidade em `dados.js` tem os campos `midia` e `depoimento`, hoje vazios (`null`). Sem eles, o resultado mostra um botão para buscar vídeos da prova no YouTube.

```js
midia: { tipo: "youtube", id: "CODIGO_DO_VIDEO", legenda: "Prova de Mecatrônica na WorldSkills 2024" },
// ou uma foto da escola, colocada numa pasta "fotos":
midia: { tipo: "imagem", src: "fotos/mecatronica.jpg", legenda: "Nossa equipe treinando" },

depoimento: { nome: "Ana Souza", info: "Mecatrônica · SP Skills 2024", texto: "…", foto: "fotos/ana.jpg" },
```

O código do vídeo é o que vem depois de `v=` no link do YouTube.

## Botão "Entenda a prova"

No slide "Como é a prova", o botão "Entenda a prova" abre um painel com o que a modalidade faz, o que mais pesa na nota (com barras), um destaque e quem procurar na escola. O story pausa enquanto o painel está aberto. O conteúdo fica em `dados.js`, em cada modalidade: `prova` (`resumo`, `pesos` como [item avaliado, % da nota] e `destaque`) e `procurar` (nome da pessoa; `null` esconde a linha). #18 Instalações Elétricas e #19 Controle Industrial ainda estão sem nome. O link para o documento completo da WorldSkills fica no fim do painel.

## Card para o story

O card não tem link, porque o jogo e a inscrição são internos da escola. No lugar do endereço, ele traz "E você? Descubra a sua" e "Faça o SkillMatch no SENAI Roberto Simonsen". No alto, o card traz o símbolo do Team 1.01 à esquerda e o brasão do SENAI Roberto Simonsen à direita.

## Teste com alunos (validação)

Peça a uns 20 alunos que joguem por `index.html?teste=1`. No modo teste, antes de começar, o aluno diz qual modalidade espera que dê. A seção "Validação" do painel mostra quantas vezes o resultado bateu. A coluna `respostas` da planilha registra cada escolha (ex.: `p3:mec d2:ctrl`), para achar respostas que estão "na cara" demais.
