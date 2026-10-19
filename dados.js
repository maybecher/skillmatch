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
  prod: { nome: "Tecnologia em Design Industrial", codigo: "#59", idade: "até 22 anos em 2028", idadeMax: 22, en: "Industrial Design Technology",
    texto: "Você cria produtos do dia a dia, do primeiro esboço ao modelo 3D e ao protótipo, pensando em formato, uso, conforto e em como ele vai ser fabricado.",
    tracos: ["Observação", "Criatividade prática", "Testar e melhorar"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1705",
    midia: null, depoimento: null },
  mecind: { nome: "Mecânica Industrial", codigo: "#01", idade: "até 20 anos em 2028", idadeMax: 20, en: "Industrial Mechanics",
    texto: "Você monta, alinha e faz a manutenção de máquinas industriais: lê desenhos, ajusta peças com precisão e coloca para rodar sistemas mecânicos, hidráulicos e pneumáticos.",
    tracos: ["Persistência", "Precisão mecânica", "Mão na massa"],
    link: "https://worldskills.org/skills/id/740/",
    midia: null, depoimento: null },
  cad:  { nome: "Projeto de Engenharia Mecânica (CAD)", codigo: "#05", idade: "até 20 anos em 2028", idadeMax: 20, en: "Mechanical Engineering CAD",
    texto: "Você projeta peças e máquinas no computador: modela em 3D, monta os conjuntos, simula os movimentos e gera os desenhos técnicos com todas as medidas para a fabricação.",
    tracos: ["Precisão", "Raciocínio espacial", "Organização"],
    link: "https://worldskills.org/skills/id/217/",
    midia: null, depoimento: null },
  movel: { nome: "Movelaria", codigo: "#24", idade: "até 20 anos em 2028", idadeMax: 20, en: "Cabinetmaking",
    texto: "Você fabrica móveis a partir de um projeto: lê o desenho, corta, faz encaixes, monta gavetas e portas que abrem e fecham perfeitas e capricha no acabamento.",
    tracos: ["Capricho", "Precisão", "Paciência"],
    link: "https://worldskills.org/skills/id/236/",
    midia: null, depoimento: null },
  marc: { nome: "Marcenaria de Estruturas", codigo: "#25", idade: "até 20 anos em 2028", idadeMax: 20, en: "Joinery",
    texto: "Você constrói peças de madeira para casas e prédios, como portas, janelas e escadas, com encaixes firmes e precisos feitos a partir de desenhos e cálculos.",
    tracos: ["Visão espacial", "Precisão", "Força com cuidado"],
    link: "https://worldskills.org/skills/id/237/",
    midia: null, depoimento: null },
  quim: { nome: "Tecnologia Laboratorial Química", codigo: "#52", idade: "até 20 anos em 2028", idadeMax: 20, en: "Chemical Laboratory Technology",
    texto: "Você trabalha num laboratório analisando amostras: prepara soluções, faz análises químicas e com equipamentos, calcula os resultados e segue normas de qualidade e segurança à risca.",
    tracos: ["Rigor", "Curiosidade científica", "Organização"],
    link: "https://worldskills.org/skills/id/544/",
    midia: null, depoimento: null }
};

/* Fotos da WorldSkills 2026 (Xangai), do Flickr oficial da WorldSkills:
   https://www.flickr.com/photos/worldskills/collections/72157725408624379/
   Licença CC BY-NC-ND 4.0: uso não comercial, com crédito e sem alterar a imagem.
   Cada modalidade tem 3 fotos, que passam em carrossel só na revelação do resultado.
   Cada foto é [id, código]: o endereço vira live.staticflickr.com/65535/{id}_{código}_c.jpg (800 px) ou _b.jpg (1024 px).
   "album" é o álbum da modalidade no Flickr. */
const FOTOS = {
  game: { album: "72177720335744216", fotos: [["55547878104", "77c8d2bfec"], ["55547878514", "c6aff0a47a"], ["55546973957", "05fa20cb79"]] },
  app:  { album: "72177720335738215", fotos: [["55546355412", "b32acb8922"], ["55547381286", "651d0769aa"], ["55547762930", "2f7974f012"]] },
  web:  { album: "72177720335755038", fotos: [["55547476336", "6655d5edc4"], ["55546449412", "a241a8767c"], ["55547857980", "e9780656ee"]] },
  ctrl: { album: "72177720335738687", fotos: [["55547765591", "e4384601e1"], ["55548144375", "76348b455d"], ["55548143920", "54a8ca7e7e"]] },
  elet: { album: "72177720335738662", fotos: [["55547757996", "489f49084d"], ["55547757821", "92ea1b7e77"], ["55546728742", "18b4bfbd28"]] },
  mec:  { album: "72177720335738562", fotos: [["55545939654", "2405154124"], ["55544743972", "ac799d89dc"], ["55544742717", "4d6e15c6cf"]] },
  i40:  { album: "72177720335767629", fotos: [["55544752712", "6cb3d4f6d3"], ["55544753042", "a358147ec9"], ["55546166030", "6d2bb98d85"]] },
  prod: { album: "72177720335738892", fotos: [["55546259687", "7cf33aae7f"], ["55547287201", "3611260510"], ["55547454014", "3117482069"]] },
  mecind: { album: "72177720335743876", fotos: [["55545872713", "58aa0abccf"], ["55546147960", "f226f7db3f"], ["55546147795", "5506413547"]] },
  cad:  { album: "72177720335767394", fotos: [["55548074765", "727abcaf68"], ["55547800148", "68fc79e6d1"], ["55547800363", "c9efaa4c5e"]] },
  movel: { album: "72177720335744026", fotos: [["55549310041", "4f09df0e98"], ["55548277352", "07f7e94690"], ["55547926714", "24acddeba2"]] },
  marc: { album: "72177720335744041", fotos: [["55547569848", "deffee7131"], ["55547463856", "dec01db422"], ["55547843565", "e7ef6ddc83"]] },
  quim: { album: "72177720335767669", fotos: [["55546167670", "910ea465d6"], ["55548007609", "58be4a560c"], ["55547946998", "1f9fa0be63"]] }
};

/* Perguntas de múltipla escolha: cada pergunta tem uma resposta para CADA modalidade.
   Na tela aparecem só 8 delas, escolhidas a cada jogo de forma equilibrada (entram as modalidades
   que apareceram menos até ali), e embaralhadas. Ao incluir uma modalidade, escreva a resposta dela em todas.
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
    prod: "Rabiscar como a ideia ficaria se fosse algo de verdade",
    mecind:"Resolver na hora quando alguma coisa emperra ou quebra",
    cad:   "Fazer o desenho certinho, com todas as medidas",
    movel: "Caprichar no acabamento para tudo ficar bonito",
    marc:  "Montar a estrutura que deixa tudo firme e de pé",
    quim:  "Seguir o roteiro passo a passo e anotar os resultados" } },
  { id: "p2", q: "No celular, o que você mais faz?", o: {
    game: "Jogo coisas com mundos grandes para explorar",
    app:  "Reparo quando um botão está no lugar errado",
    web:  "Fico pulando de link em link, pesquisando",
    ctrl: "Deixo tudo programado para acontecer no horário certo",
    elet: "Vejo vídeos de antes e depois de reformas",
    mec:  "Vejo vídeos de gente consertando coisas",
    i40:  "Acompanho meus números: passos, tempo de tela, rankings",
    prod: "Salvo fotos de objetos bonitos e bem pensados",
    mecind:"Vejo vídeos de máquinas gigantes funcionando",
    cad:   "Brinco com apps de desenhar e montar coisas em 3D",
    movel: "Salvo ideias de móveis planejados e decoração",
    marc:  "Vejo vídeos de encaixes de madeira feitos sem prego",
    quim:  "Vejo vídeos de experimentos e reações químicas" } },
  { id: "p3", q: "Qual atividade te prende por horas sem você perceber?", o: {
    game: "Imaginar histórias e como seriam os personagens",
    app:  "Pensar em soluções para pequenos problemas do dia a dia",
    web:  "Arrumar e personalizar meu perfil nas redes",
    ctrl: "Sudoku, quebra-cabeças e desafios de lógica",
    elet: "Ajudar em casa quando algo precisa ser instalado",
    mec:  "Montar coisas seguindo o manual, como móveis ou Lego",
    i40:  "Jogos em que você administra uma cidade ou empresa",
    prod: "Criar coisas com papelão, massinha ou sucata",
    mecind:"Desmontar uma máquina e montar de novo, peça por peça",
    cad:   "Desenhar projetos com régua, esquadro ou no computador",
    movel: "Lixar, pintar e reformar um móvel velho",
    marc:  "Construir coisas de madeira que precisam aguentar peso",
    quim:  "Fazer misturas e experimentos para ver o que acontece" } },
  { id: "p4", q: "Você ganhou um presente para escolher. Qual leva?", o: {
    game: "Um caderno de desenho com lápis bons",
    app:  "Um celular novo",
    web:  "Um computador mais rápido",
    ctrl: "Luzes que acendem e mudam sozinhas no quarto",
    elet: "Um kit de ferramentas",
    mec:  "Um carrinho para montar que anda sozinho",
    i40:  "Um relógio que mede tudo e mostra em gráficos",
    prod: "Um kit de materiais para criar e montar ideias",
    mecind:"Um motor antigo para desmontar e restaurar",
    cad:   "Um programa profissional de desenho 3D",
    movel: "Madeira boa e ferramentas para fazer um móvel",
    marc:  "Um jogo de formões e serrotes de marceneiro",
    quim:  "Um kit de laboratório com tubos de ensaio" } },
  { id: "p5", q: "Você se considera uma pessoa mais…", o: {
    game: "Criativa e sonhadora",
    app:  "Comunicativa, que pensa nos outros",
    web:  "Curiosa, que vive pesquisando",
    ctrl: "Lógica e metódica",
    elet: "Cuidadosa e responsável",
    mec:  "Habilidosa com as mãos",
    i40:  "Líder, que enxerga o todo",
    prod: "Observadora, que repara nos detalhes",
    mecind:"Persistente, que não larga até funcionar",
    cad:   "Precisa, que confere cada medida",
    movel: "Caprichosa, que gosta de coisa bem-feita",
    marc:  "Prática, que gosta de ver a coisa firme e de pé",
    quim:  "Investigadora, que testa até ter certeza" } },
  { id: "p6", q: "Como seria o seu dia de trabalho ideal?", o: {
    game: "Criando algo do zero que ninguém nunca viu",
    app:  "Conversando com pessoas para entender o que elas precisam",
    web:  "No computador, construindo algo que qualquer um pode acessar",
    ctrl: "Garantindo que tudo aconteça na ordem certa",
    elet: "Cada dia num lugar diferente, deixando tudo funcionando",
    mec:  "Com ferramentas na mão, ajustando e consertando",
    i40:  "Acompanhando tudo numa tela grande e tomando decisões",
    prod: "Desenhando, testando e refazendo até ficar perfeito",
    mecind:"Numa fábrica, mantendo as máquinas grandes rodando",
    cad:   "No computador, projetando peças que depois serão fabricadas",
    movel: "Na oficina, transformando madeira em móveis",
    marc:  "Na oficina, fazendo portas, janelas e escadas de madeira",
    quim:  "Num laboratório, de jaleco, analisando amostras" } },
  { id: "p7", q: "O que te deixaria mais satisfeito no fim do dia?", o: {
    game: "Ver algo que só existia na minha cabeça ganhar forma",
    app:  "Alguém dizer que o que eu fiz facilitou a vida dele",
    web:  "Mandar um link e todo mundo ver o que eu fiz",
    ctrl: "Algo que eu fazia na mão agora acontecer sozinho",
    elet: "Ligar e tudo funcionar de primeira, sem risco",
    mec:  "Uma coisa parada voltar a funcionar",
    i40:  "Ver várias partes trabalhando juntas, sem falha",
    prod: "Pegar na mão uma coisa que eu inventei",
    mecind:"Alinhar e ajustar uma máquina até ela rodar macia",
    cad:   "Ver que meu desenho tinha todas as medidas certas",
    movel: "Uma gaveta que eu fiz deslizar perfeita",
    marc:  "Subir numa escada que eu fiz e ela não ranger",
    quim:  "Descobrir exatamente o que tinha numa amostra" } },
  { id: "p8", q: "Num filme, no que você mais repara?", o: {
    game: "Nos cenários e nas criaturas",
    app:  "Em como os personagens se comunicam e resolvem tudo rápido",
    web:  "Nas cenas de investigação, procurando pistas",
    ctrl: "Nos painéis cheios de botões e luzes piscando",
    elet: "Na cena em que a energia cai e alguém precisa religar",
    mec:  "Nas perseguições com carros e máquinas",
    i40:  "Nas cidades do futuro, onde tudo é conectado",
    prod: "Nos objetos e aparelhos diferentes que aparecem",
    mecind:"Nas engrenagens e máquinas enormes das fábricas",
    cad:   "Nos projetos abertos na mesa dos engenheiros",
    movel: "Nos móveis e nos detalhes de madeira dos cenários",
    marc:  "Nas casas antigas, com portas e escadas de madeira trabalhada",
    quim:  "Nas cenas de laboratório, com tubos e líquidos coloridos" } },
  { id: "p9", q: "Você prefere trabalhar…", o: {
    game: "Sozinho, de fone, no meu mundo",
    app:  "Ouvindo a opinião de quem vai usar",
    web:  "Resolvendo um problema de cada vez, com calma",
    ctrl: "Com regras e etapas bem definidas",
    elet: "Em movimento, cada dia num lugar",
    mec:  "Em dupla, um ajudando o outro",
    i40:  "Em equipe, cada um com uma função",
    prod: "Testando várias versões até achar a melhor",
    mecind:"Com peças pesadas e ferramentas de precisão",
    cad:   "No computador, com tudo medido e calculado",
    movel: "Sem pressa, cuidando de cada detalhe",
    marc:  "Calculando e marcando cada encaixe antes de cortar",
    quim:  "Num lugar limpo e organizado, com tudo anotado" } },
  { id: "p10", q: "Qual frase mais combina com você?", o: {
    game: "Eu crio mundos na minha cabeça",
    app:  "Isso podia ser mais simples",
    web:  "Deixa que eu pesquiso",
    ctrl: "Cada coisa no seu lugar e na hora certa",
    elet: "Melhor prevenir do que remediar",
    mec:  "Deixa eu abrir para ver por dentro",
    i40:  "Tudo está conectado",
    prod: "Isso podia ter um formato melhor",
    mecind:"Se tem um barulho estranho, eu acho de onde vem",
    cad:   "Antes de fazer, eu desenho",
    movel: "O acabamento é o que faz a diferença",
    marc:  "Meça duas vezes, corte uma",
    quim:  "Tudo tem uma fórmula" } },
  { id: "p11", q: "Andando pela cidade, o que chama a sua atenção?", o: {
    game: "Os grafites e a arte nas paredes",
    app:  "Como as pessoas se viram na correria do dia a dia",
    web:  "As placas e anúncios cheios de informação",
    ctrl: "Semáforos, catracas e portas que abrem sozinhas",
    elet: "Os fios nos postes e os prédios em construção",
    mec:  "Ônibus, motos e máquinas de obra",
    i40:  "Como tudo funciona junto: trânsito, entregas, filas",
    prod: "Bancos, lixeiras e outros objetos espalhados pela cidade",
    mecind:"Escadas rolantes, elevadores e guindastes",
    cad:   "Como as peças de uma bicicleta se encaixam",
    movel: "As vitrines das lojas de móveis",
    marc:  "Portas, janelas e escadas de madeira das casas antigas",
    quim:  "A cor da água dos rios e a fumaça das chaminés" } },
  { id: "p12", q: "Se a escola criasse uma matéria nova, qual você escolheria?", o: {
    game: "Criação de histórias e personagens",
    app:  "Comportamento das pessoas",
    web:  "Comunicação e informação",
    ctrl: "Lógica e raciocínio",
    elet: "Energia: de onde vem e como chega em casa",
    mec:  "Como as máquinas funcionam",
    i40:  "Tecnologia e o futuro do trabalho",
    prod: "Invenções e criação de objetos",
    mecind:"Manutenção de máquinas",
    cad:   "Desenho técnico",
    movel: "Criação de móveis",
    marc:  "Construção com madeira",
    quim:  "Química experimental" } }
];

/* Perguntas "isso ou aquilo": separam perfis parecidos.
   Este é um banco de duelos: a cada jogo são sorteados 8, dando prioridade às modalidades que apareceram menos.
   Eles aparecem intercalados com as perguntas de múltipla escolha. Toda modalidade deve estar em pelo menos 2 duelos. */
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
    prod: "Desenhar um objeto pensando em quem vai usar" } },
  { id: "d9", q: "Com madeira, o que você prefere fazer?", o: {
    movel: "Um móvel com gavetas e acabamento perfeito",
    marc:  "Uma escada ou uma janela, com encaixes bem firmes" } },
  { id: "d10", q: "Uma peça de máquina quebrou. Você prefere…", o: {
    cad:    "Desenhar no computador a peça nova, com todas as medidas",
    mecind: "Trocar a peça e deixar a máquina rodando de novo" } },
  { id: "d11", q: "Você prefere trabalhar com…", o: {
    quim: "Substâncias e experimentos num laboratório",
    elet: "Fios, quadros e tomadas numa obra" } },
  { id: "d12", q: "No projeto de um produto novo, você prefere…", o: {
    cad:  "Detalhar cada peça com medidas exatas",
    prod: "Criar o formato e pensar em como as pessoas vão usar" } },
  { id: "d13", q: "Numa fábrica, você prefere…", o: {
    mecind: "Montar e alinhar máquinas grandes e pesadas",
    mec:    "Programar e ajustar máquinas automáticas" } },
  { id: "d14", q: "Você prefere criar…", o: {
    movel: "Um móvel de verdade, feito à mão na madeira",
    prod:  "O projeto de um objeto que vai ser fabricado aos milhares" } },
  { id: "d15", q: "Numa casa em construção, você ficaria com…", o: {
    marc: "As portas, janelas e escadas de madeira",
    elet: "Toda a parte elétrica" } },
  { id: "d16", q: "Você prefere acompanhar…", o: {
    quim: "Os resultados das análises de um laboratório",
    i40:  "Os dados de uma fábrica inteira numa tela" } }
];
/* ===================================================================== */
