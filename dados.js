/* =====================================================================
   TEMPLATE — edite aqui. Para mudar o jogo, basta alterar estes dados.
   Este arquivo é usado pelo jogo (index.html) e pelo painel (painel.html).
   ===================================================================== */
const CONFIG = {
  evento: "SP Skills 2028",
  anoEvento: 2028,                 // usado para calcular a idade do aluno na competição
  escola: "Escola SENAI Roberto Simonsen",

  // Link do formulário de inscrição (usado se o pré-preenchimento abaixo estiver vazio).
  formUrl: "https://forms.gle/NUW8gWpfebji2kCA8",

  // Pré-preenchimento do Google Forms: o aluno já chega com nome e modalidade escolhidos.
  // Veja o passo a passo no LEIAME.md. Deixe "" para não usar.
  formPrefill: {
    url: "",              // ex.: "https://docs.google.com/forms/d/e/1FAIpQL.../viewform"
    campoNome: "",        // ex.: "entry.123456789"
    campoModalidade: ""   // ex.: "entry.987654321" (o texto enviado é o nome da modalidade)
  },

  // Endereço público do jogo, impresso no card de story. "" = usa o endereço atual da página.
  jogoUrl: "",

  // URL do Apps Script que registra os resultados numa planilha (veja apps-script.gs).
  // "" = os resultados ficam guardados só neste aparelho (útil num totem/computador da escola).
  registroUrl: ""
};

/* idadeMax: idade máxima no ano do evento (null = sem verificação automática).
   en: nome em inglês, usado para buscar vídeos da prova.
   midia: foto ou vídeo da prova. Ex.: { tipo: "youtube", id: "dQw4w9WgXcQ", legenda: "..." }
          ou { tipo: "imagem", src: "fotos/mecatronica.jpg", legenda: "..." }
   depoimento: ex-competidor da escola. Ex.: { nome: "Ana Souza", info: "WorldSkills 2024", texto: "...", foto: "fotos/ana.jpg" } */
const MODALIDADES = {
  game: { nome: "3D Game Art", codigo: "#50", idade: "até 20 anos em 2028", idadeMax: 20, en: "3D Digital Game Art",
    texto: "Você cria personagens, objetos e cenários em 3D prontos para entrar em um jogo: modelagem, escultura digital, textura, rig e animação, tudo testado dentro de uma game engine.",
    tracos: ["Olhar estético", "Imaginação", "Paciência com detalhe"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1708",
    midia: null, depoimento: null },
  app:  { nome: "Desenvolvimento de Aplicativos Móveis", codigo: "#08", idade: "até 20 anos em 2028", idadeMax: 20, en: "Mobile Applications Development",
    texto: "Você projeta e programa aplicativos para celular, da tela que o usuário toca até a comunicação com os dados. Cada detalhe de facilidade de uso conta pontos.",
    tracos: ["Lógica", "Empatia com o usuário", "Resolver problemas do dia a dia"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1659",
    midia: null, depoimento: null },
  web:  { nome: "Tech Web", codigo: "#17", idade: "até 20 anos em 2028", idadeMax: 20, en: "Web Technologies",
    texto: "Você constrói sites e sistemas web completos: a parte que o usuário vê, a parte que roda no servidor e o banco de dados, com tempo contado e um cliente para atender.",
    tracos: ["Curiosidade digital", "Organização de informação", "Foco"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1693",
    midia: null, depoimento: null },
  ctrl: { nome: "Controle Industrial", codigo: "#19", idade: "até 20 anos em 2028", idadeMax: 20, en: "Industrial Control",
    texto: "Você monta e programa painéis de comando que fazem motores e máquinas trabalharem na ordem certa, sozinhos e com segurança.",
    tracos: ["Raciocínio lógico", "Organização", "Capricho na montagem"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1683",
    midia: null, depoimento: null },
  elet: { nome: "Instalações Elétricas", codigo: "#18", idade: "até 20 anos em 2028", idadeMax: 20, en: "Electrical Installations",
    texto: "Você planeja, instala e testa a parte elétrica de casas, comércios e indústrias, seguindo normas à risca. Acabamento e testes finais pesam muito na nota.",
    tracos: ["Mão na massa", "Responsabilidade", "Precisão"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1677",
    midia: null, depoimento: null },
  mec:  { nome: "Mecatrônica", codigo: "#04", idade: "até 22 anos em 2028", idadeMax: 22, en: "Mechatronics",
    texto: "Em dupla, você monta, programa e coloca para rodar máquinas automáticas que juntam mecânica, ar comprimido, eletrônica e programação. Também acha e conserta falhas.",
    tracos: ["Habilidade manual", "Trabalho em dupla", "Entender como funciona"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1665",
    midia: null, depoimento: null },
  i40:  { nome: "Indústria 4.0", codigo: "#48", idade: "até 22 anos em 2028", idadeMax: 22, en: "Industry 4.0",
    texto: "Em equipe, você conecta máquinas, redes e dados para formar uma fábrica inteligente, que se monitora e mostra tudo o que está acontecendo.",
    tracos: ["Liderança", "Visão do todo", "Trabalho em equipe"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1703",
    midia: null, depoimento: null },
  prod: { nome: "Design de Produtos", codigo: "#59", idade: "confirme com a coordenação", idadeMax: null, en: "Product Design",
    texto: "Você cria produtos do dia a dia, do primeiro esboço ao modelo 3D e ao protótipo, pensando em formato, uso, conforto e em como ele vai ser fabricado.",
    tracos: ["Observação", "Criatividade prática", "Testar e melhorar"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1705",
    midia: null, depoimento: null }
};

/* Foto oficial de cada modalidade no site da WorldSkills (worldskills.org/skills), mostrada só no resultado.
   "img" é o endereço base da imagem: o jogo usa a versão _medium (640 px) e a original (2000 px) em telas de alta densidade.
   "pagina" é a página da modalidade na WorldSkills, usada no crédito da foto. */
const FOTOS = {
  game: { img: "https://images.worldskillsusercontent.org/wsf1/ws03/22271/wsf1039f50-c4df-4a0a-adc2-ddabb167fb6a", pagina: "https://worldskills.org/skills/id/483/" },
  app:  { img: "https://images.worldskillsusercontent.org/wscd/ws12/31397/wscd12ee3f-ebc9-4081-9cdb-43e003a876ed", pagina: "https://worldskills.org/skills/id/562/" },
  web:  { img: "https://images.worldskillsusercontent.org/ws72/wsdb/22266/ws72dbd2f9-281e-41cf-9349-77bee08d63cd", pagina: "https://worldskills.org/skills/id/127/" },
  ctrl: { img: "https://images.worldskillsusercontent.org/ws2a/ws62/22253/ws2a6208f2-620a-4768-a731-e66bebe13ecd", pagina: "https://worldskills.org/skills/id/146/" },
  elet: { img: "https://images.worldskillsusercontent.org/wsdd/wsdf/22251/wsdddfcfce-c92b-4e69-9fab-d7f8a1648c41", pagina: "https://worldskills.org/skills/id/145/" },
  mec:  { img: "https://images.worldskillsusercontent.org/ws73/ws47/22259/ws7347bac4-92a1-4692-b74e-c4f46e74f414", pagina: "https://worldskills.org/skills/id/216/" },
  i40:  { img: "https://images.worldskillsusercontent.org/ws6c/ws62/31395/ws6c6210f5-034d-4148-93fb-817648a4797f", pagina: "https://worldskills.org/skills/id/786/" },
  prod: { img: "https://images.worldskillsusercontent.org/ws82/wsd4/32881/ws82d4cda6-59f3-4e1b-a19b-32a9931c25db", pagina: "https://worldskills.org/skills/id/557/" } // Industrial Design Technology
};

/* Perguntas de 8 opções: uma resposta para cada modalidade, embaralhadas na tela.
   O "id" identifica a pergunta nos registros; não mude o id de uma pergunta já usada. */
const PERGUNTAS = [
  { id: "p1", q: "Num trabalho em grupo da escola, você costuma…", o: {
    game: "Inventar a história e os personagens do trabalho",
    app:  "Pensar em como explicar para quem não sabe nada do assunto",
    web:  "Juntar tudo num lugar só, bem organizado, onde todo mundo acessa",
    ctrl: "Montar o cronograma: quem faz o quê e quando",
    elet: "Revisar tudo para ter certeza de que está certo",
    mec:  "Ficar com a parte que precisa construir alguma coisa",
    i40:  "Juntar a parte de cada um e ver se tudo se encaixa",
    prod: "Rabiscar como a ideia ficaria se fosse algo de verdade" } },
  { id: "p2", q: "No celular, o que você mais faz?", o: {
    game: "Jogo coisas com mundos grandes para explorar",
    app:  "Reparo quando um botão está no lugar errado",
    web:  "Fico pulando de link em link, pesquisando",
    ctrl: "Deixo tudo programado para acontecer no horário certo",
    elet: "Vejo vídeos de antes e depois de reformas",
    mec:  "Vejo vídeos de gente consertando coisas",
    i40:  "Acompanho meus números: passos, tempo de tela, rankings",
    prod: "Salvo fotos de objetos bonitos e bem pensados" } },
  { id: "p3", q: "Qual atividade te prende por horas sem você perceber?", o: {
    game: "Imaginar histórias e como seriam os personagens",
    app:  "Pensar em soluções para pequenos problemas do dia a dia",
    web:  "Arrumar e personalizar meu perfil nas redes",
    ctrl: "Sudoku, quebra-cabeças e desafios de lógica",
    elet: "Ajudar em casa quando algo precisa ser instalado",
    mec:  "Montar coisas seguindo o manual, como móveis ou Lego",
    i40:  "Jogos em que você administra uma cidade ou empresa",
    prod: "Criar coisas com papelão, massinha ou sucata" } },
  { id: "p4", q: "Você ganhou um presente para escolher. Qual leva?", o: {
    game: "Um caderno de desenho com lápis bons",
    app:  "Um celular novo",
    web:  "Um computador mais rápido",
    ctrl: "Luzes que acendem e mudam sozinhas no quarto",
    elet: "Um kit de ferramentas",
    mec:  "Um carrinho para montar que anda sozinho",
    i40:  "Um relógio que mede tudo e mostra em gráficos",
    prod: "Um kit de materiais para criar e montar ideias" } },
  { id: "p5", q: "Você se considera uma pessoa mais…", o: {
    game: "Criativa e sonhadora",
    app:  "Comunicativa, que pensa nos outros",
    web:  "Curiosa, que vive pesquisando",
    ctrl: "Lógica e metódica",
    elet: "Cuidadosa e responsável",
    mec:  "Habilidosa com as mãos",
    i40:  "Líder, que enxerga o todo",
    prod: "Observadora, que repara nos detalhes" } },
  { id: "p6", q: "Como seria o seu dia de trabalho ideal?", o: {
    game: "Criando algo do zero que ninguém nunca viu",
    app:  "Conversando com pessoas para entender o que elas precisam",
    web:  "No computador, construindo algo que qualquer um pode acessar",
    ctrl: "Garantindo que tudo aconteça na ordem certa",
    elet: "Cada dia num lugar diferente, deixando tudo funcionando",
    mec:  "Com ferramentas na mão, ajustando e consertando",
    i40:  "Acompanhando tudo numa tela grande e tomando decisões",
    prod: "Desenhando, testando e refazendo até ficar perfeito" } },
  { id: "p7", q: "O que te deixaria mais satisfeito no fim do dia?", o: {
    game: "Ver algo que só existia na minha cabeça ganhar forma",
    app:  "Alguém dizer que o que eu fiz facilitou a vida dele",
    web:  "Mandar um link e todo mundo ver o que eu fiz",
    ctrl: "Algo que eu fazia na mão agora acontecer sozinho",
    elet: "Ligar e tudo funcionar de primeira, sem risco",
    mec:  "Uma coisa parada voltar a funcionar",
    i40:  "Ver várias partes trabalhando juntas, sem falha",
    prod: "Pegar na mão uma coisa que eu inventei" } },
  { id: "p8", q: "Num filme, no que você mais repara?", o: {
    game: "Nos cenários e nas criaturas",
    app:  "Em como os personagens se comunicam e resolvem tudo rápido",
    web:  "Nas cenas de investigação, procurando pistas",
    ctrl: "Nos painéis cheios de botões e luzes piscando",
    elet: "Na cena em que a energia cai e alguém precisa religar",
    mec:  "Nas perseguições com carros e máquinas",
    i40:  "Nas cidades do futuro, onde tudo é conectado",
    prod: "Nos objetos e aparelhos diferentes que aparecem" } },
  { id: "p9", q: "Você prefere trabalhar…", o: {
    game: "Sozinho, de fone, no meu mundo",
    app:  "Ouvindo a opinião de quem vai usar",
    web:  "Resolvendo um problema de cada vez, com calma",
    ctrl: "Com regras e etapas bem definidas",
    elet: "Em movimento, cada dia num lugar",
    mec:  "Em dupla, um ajudando o outro",
    i40:  "Em equipe, cada um com uma função",
    prod: "Testando várias versões até achar a melhor" } },
  { id: "p10", q: "Qual frase mais combina com você?", o: {
    game: "Eu crio mundos na minha cabeça",
    app:  "Isso podia ser mais simples",
    web:  "Deixa que eu pesquiso",
    ctrl: "Cada coisa no seu lugar e na hora certa",
    elet: "Melhor prevenir do que remediar",
    mec:  "Deixa eu abrir para ver por dentro",
    i40:  "Tudo está conectado",
    prod: "Isso podia ter um formato melhor" } },
  { id: "p11", q: "Andando pela cidade, o que chama a sua atenção?", o: {
    game: "Os grafites e a arte nas paredes",
    app:  "Como as pessoas se viram na correria do dia a dia",
    web:  "As placas e anúncios cheios de informação",
    ctrl: "Semáforos, catracas e portas que abrem sozinhas",
    elet: "Os fios nos postes e os prédios em construção",
    mec:  "Ônibus, motos e máquinas de obra",
    i40:  "Como tudo funciona junto: trânsito, entregas, filas",
    prod: "Bancos, lixeiras e outros objetos espalhados pela cidade" } },
  { id: "p12", q: "Se a escola criasse uma matéria nova, qual você escolheria?", o: {
    game: "Criação de histórias e personagens",
    app:  "Comportamento das pessoas",
    web:  "Comunicação e informação",
    ctrl: "Lógica e raciocínio",
    elet: "Energia: de onde vem e como chega em casa",
    mec:  "Como as máquinas funcionam",
    i40:  "Tecnologia e o futuro do trabalho",
    prod: "Invenções e criação de objetos" } }
];

/* Perguntas "isso ou aquilo": separam perfis parecidos.
   Cada modalidade aparece em exatamente 2 duelos, para nenhuma ganhar vantagem.
   Elas aparecem intercaladas com as perguntas de 8 opções. */
const DUELOS = [
  { id: "d1", q: "Num app de delivery, qual parte você ia gostar mais de fazer?", o: {
    app: "A tela em que a pessoa escolhe e pede com dois toques",
    web: "O sistema por trás, que recebe os pedidos e guarda tudo" } },
  { id: "d2", q: "Uma esteira da fábrica parou. Você prefere…", o: {
    mec:  "Ir até a máquina, abrir e achar a peça com defeito",
    ctrl: "Ir ao painel de comando e descobrir qual etapa da sequência falhou" } },
  { id: "d3", q: "Você prefere que as coisas que você cria…", o: {
    game: "Existam num mundo digital, onde tudo é possível",
    prod: "Existam no mundo real, para alguém pegar na mão" } },
  { id: "d4", q: "Num prédio novo, você preferiria…", o: {
    elet: "Deixar cada tomada, quadro e fio instalado no padrão certinho",
    i40:  "Ligar todos os equipamentos numa rede e acompanhar os dados deles" } },
  { id: "d5", q: "Com eletricidade, o que te atrai mais?", o: {
    ctrl: "Fazer um motor ligar, parar e inverter sozinho, na hora certa",
    elet: "Deixar a instalação de uma casa inteira segura e bem acabada" } },
  { id: "d6", q: "Num time de robótica, você seria quem…", o: {
    mec: "Monta e ajusta o robô com as próprias mãos",
    i40: "Conecta tudo e acompanha os dados para o time decidir" } },
  { id: "d7", q: "Num jogo de celular, você repara mais…", o: {
    app:  "Se os menus e botões são fáceis de usar",
    game: "No visual dos personagens e cenários" } },
  { id: "d8", q: "Num projeto novo, você gosta mais de…", o: {
    web:  "Organizar as informações para as pessoas acharem tudo rápido",
    prod: "Desenhar um objeto pensando em quem vai usar" } }
];
/* ===================================================================== */
