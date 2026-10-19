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
   prova: explicação da prova, mostrada no botão "Entenda a prova". pesos = [o que é avaliado, % da nota].
   procurar: pessoa da escola que o aluno pode procurar sobre a modalidade (null = não mostra).
             A frase sai "Procure o/a professor/a {nome} na escola". Para outra forma, acrescente na modalidade
             tratamento: "a professora" ou tratamento: "o professor".
   depoimento: ex-competidor da escola. Ex.: { nome: "Ana Souza", info: "WorldSkills 2024", texto: "...", foto: "fotos/ana.jpg" } */
const MODALIDADES = {
  game: { nome: "3D Game Art", codigo: "#50", idade: "até 20 anos em 2028", idadeMax: 20, en: "3D Digital Game Art",
    texto: "Você cria personagens, objetos e cenários em 3D prontos para entrar em um jogo: modelagem, escultura digital, textura, rig e animação, tudo testado dentro de uma game engine.",
    tracos: ["Olhar estético", "Imaginação", "Paciência com detalhe"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1708",
    prova: {
      resumo: "Cria personagens, objetos e cenários para jogos a partir do pedido de um designer, ao lado de programadores.",
      pesos: [["Modelagem 3D", 25], ["Texturas", 18], ["Desenho do conceito em 2D", 15], ["Esqueleto e animação dos personagens", 12], ["Testes dentro do motor do jogo", 10]],
      destaque: "O desenho em 2D conta bastante: gostar de desenhar ajuda muito." },
    procurar: "Ana Beatriz Gondim",
    midia: null, depoimento: null },
  app:  { nome: "Desenvolvimento de Aplicativos Móveis", codigo: "#08", idade: "até 20 anos em 2028", idadeMax: 20, en: "Mobile Applications Development",
    texto: "Você projeta e programa aplicativos para celular, da tela que o usuário toca até a comunicação com os dados. Cada detalhe de facilidade de uso conta pontos.",
    tracos: ["Lógica", "Empatia com o usuário", "Resolver problemas do dia a dia"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1659",
    prova: {
      resumo: "Cria apps para celular, tablet e relógio, como funcionário de empresa ou como freelancer.",
      pesos: [["Programar as funções do app", 30], ["Planejar as telas e a experiência de quem usa", 25]],
      destaque: "Você usa câmera, GPS e sensores do aparelho, conecta o app a servidores e bancos de dados, entende o que o cliente precisa e apresenta a solução para ele." },
    procurar: "Caroline Falcão",
    midia: null, depoimento: null },
  web:  { nome: "Tech Web", codigo: "#17", idade: "até 20 anos em 2028", idadeMax: 20, en: "Web Technologies",
    texto: "Você constrói sites e sistemas web completos: a parte que o usuário vê, a parte que roda no servidor e o banco de dados, com tempo contado e um cliente para atender.",
    tracos: ["Curiosidade digital", "Organização de informação", "Foco"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1693",
    prova: {
      resumo: "Cria sites e sistemas web, sozinho ou em agências, e pode se especializar em visual, experiência do usuário, front-end ou back-end.",
      pesos: [["Back-end, a parte que roda no servidor", 40], ["Visual", 25], ["Front-end", 25]],
      destaque: "O que mais pesa é a parte que o usuário não vê: o back-end, que faz o site funcionar por trás." },
    procurar: "Philipe Borges",
    midia: null, depoimento: null },
  ctrl: { nome: "Controle Industrial", codigo: "#19", idade: "até 20 anos em 2028", idadeMax: 20, en: "Industrial Control",
    texto: "Você monta e programa painéis de comando que fazem motores e máquinas trabalharem na ordem certa, sozinhos e com segurança.",
    tracos: ["Raciocínio lógico", "Organização", "Capricho na montagem"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1683",
    prova: {
      resumo: "É parecido com Instalações Elétricas, mas com mais foco em automação: painéis de comando, CLPs e telas de operação.",
      pesos: [["Programação", 30], ["Instalação dos cabos e equipamentos na área da máquina", 25], ["Montagem do painel", 15]],
      destaque: "Também tem cálculos elétricos, configuração de motores (inversores e servos) e localização de falhas com multímetro." },
    procurar: null,
    midia: null, depoimento: null },
  elet: { nome: "Instalações Elétricas", codigo: "#18", idade: "até 20 anos em 2028", idadeMax: 20, en: "Electrical Installations",
    texto: "Você planeja, instala e testa a parte elétrica de casas, comércios e indústrias, seguindo normas à risca. Acabamento e testes finais pesam muito na nota.",
    tracos: ["Mão na massa", "Responsabilidade", "Precisão"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1677",
    prova: {
      resumo: "Cuida da parte elétrica de casas, comércios, indústrias e propriedades rurais. Um erro sai caro e pode colocar vidas em risco.",
      pesos: [["Instalação", 35], ["Testes antes e depois de ligar a energia", 25], ["Achar e consertar falhas", 15]],
      destaque: "Inclui tecnologias atuais, como carregador de carro elétrico e painel solar." },
    procurar: null,
    midia: null, depoimento: null },
  mec:  { nome: "Mecatrônica", codigo: "#04", idade: "até 22 anos em 2028", idadeMax: 22, en: "Mechatronics",
    texto: "Em dupla, você monta, programa e coloca para rodar máquinas automáticas que juntam mecânica, ar comprimido, eletrônica e programação. Também acha e conserta falhas.",
    tracos: ["Habilidade manual", "Trabalho em dupla", "Entender como funciona"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1665",
    prova: {
      resumo: "Junta mecânica, ar comprimido, sistema hidráulico, eletrônica, robôs e internet industrial, em linhas automáticas de montagem, embalagem e logística.",
      pesos: [["Programar os controladores da máquina (CLP)", 20], ["Escrever o software de controle", 20], ["Montar o sistema", 15], ["Achar falhas", 15]],
      destaque: "A programação vale 40% da nota: não é só montar, é fazer a máquina pensar." },
    procurar: "Roger Garcia",
    midia: null, depoimento: null },
  i40:  { nome: "Indústria 4.0", codigo: "#48", idade: "até 22 anos em 2028", idadeMax: 22, en: "Industry 4.0",
    texto: "Em equipe, você conecta máquinas, redes e dados para formar uma fábrica inteligente, que se monitora e mostra tudo o que está acontecendo.",
    tracos: ["Liderança", "Visão do todo", "Trabalho em equipe"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1703",
    prova: {
      resumo: "Melhora fábricas usando tecnologia digital: monta e programa a automação, conecta máquinas em rede, protege o sistema contra ataques e usa os dados para fazer a produção render mais. Trabalha principalmente em indústrias grandes e complexas.",
      pesos: [["Programar e trabalhar com dados", 20], ["Redes com segurança contra ataques digitais", 20], ["Projetar, montar e colocar o sistema para funcionar", 15], ["Otimizar a produção", 15]],
      destaque: null },
    procurar: "Caio de Paula",
    midia: null, depoimento: null },
  prod: { nome: "Tecnologia em Design Industrial", codigo: "#59", idade: "até 22 anos em 2028", idadeMax: 22, en: "Industrial Design Technology",
    texto: "Você cria produtos do dia a dia, do primeiro esboço ao modelo 3D e ao protótipo, pensando em formato, uso, conforto e em como ele vai ser fabricado.",
    tracos: ["Observação", "Criatividade prática", "Testar e melhorar"],
    link: "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1705",
    prova: {
      resumo: "Cria produtos fabricados em grande quantidade, que precisam funcionar bem, ser bonitos, possíveis de fabricar e ter bom preço.",
      pesos: [["Esboços e modelagem 3D", 25], ["Desenvolvimento técnico, com custos, materiais e normas", 25], ["Protótipo e testes", 15], ["Pesquisa com usuários e apresentação do produto, até a embalagem", 10]],
      destaque: "A sustentabilidade aparece em quase todas as partes da prova." },
    procurar: "Carlos Yoshio",
    midia: null, depoimento: null },
  mecind: { nome: "Mecânica Industrial", codigo: "#01", idade: "até 20 anos em 2028", idadeMax: 20, en: "Industrial Mechanics",
    texto: "Você monta, alinha e faz a manutenção de máquinas industriais: lê desenhos, ajusta peças com precisão e coloca para rodar sistemas mecânicos, hidráulicos e pneumáticos.",
    tracos: ["Persistência", "Precisão mecânica", "Mão na massa"],
    link: "https://worldskills.org/skills/id/740/",
    prova: {
      resumo: "Instala, coloca para funcionar, faz manutenção e conserta máquinas de fábrica. O ambiente pode ser perigoso e pede muita responsabilidade.",
      pesos: [["Instalação", 35], ["Resolver problemas, testar e entregar a máquina funcionando", 15], ["Manutenção e reparo", 15]],
      destaque: "Também tem solda MIG/MAG, rolamentos e transmissões, e até programas simples de CLP e inversor de frequência." },
    procurar: "Rodrigo Romero",
    midia: null, depoimento: null },
  cad:  { nome: "Projeto de Engenharia Mecânica (CAD)", codigo: "#05", idade: "até 20 anos em 2028", idadeMax: 20, en: "Mechanical Engineering CAD",
    texto: "Você projeta peças e máquinas no computador: modela em 3D, monta os conjuntos, simula os movimentos e gera os desenhos técnicos com todas as medidas para a fabricação.",
    tracos: ["Precisão", "Raciocínio espacial", "Organização"],
    link: "https://worldskills.org/skills/id/217/",
    prova: {
      resumo: "Projeta peças e máquinas no computador, para carros, navios, aviões e produtos.",
      pesos: [["Modelagem 3D", 30], ["Desenho técnico com medidas e tolerâncias", 30], ["Engenharia reversa", 15], ["Imagens realistas e animações", 10]],
      destaque: "Na engenharia reversa, você mede uma peça de verdade com instrumentos, esboça à mão e redesenha no computador." },
    procurar: "Emerson Agostinho",
    midia: null, depoimento: null },
  movel: { nome: "Movelaria", codigo: "#24", idade: "até 20 anos em 2028", idadeMax: 20, en: "Cabinetmaking",
    texto: "Você fabrica móveis a partir de um projeto: lê o desenho, corta, faz encaixes, monta gavetas e portas que abrem e fecham perfeitas e capricha no acabamento.",
    tracos: ["Capricho", "Precisão", "Paciência"],
    link: "https://worldskills.org/skills/id/236/",
    prova: {
      resumo: "Faz móveis soltos e planejados, em oficina, para casas e empresas. Além da madeira, usa couro, metal e plástico.",
      pesos: [["Escolher e preparar o material", 22], ["Fazer os encaixes e montar", 21], ["Trabalhar com desenhos", 15]],
      destaque: "Gavetas e portas precisam ficar com a mesma folga em todos os lados." },
    procurar: "Luiz Felipe",
    midia: null, depoimento: null },
  marc: { nome: "Marcenaria de Estruturas", codigo: "#25", idade: "até 20 anos em 2028", idadeMax: 20, en: "Joinery",
    texto: "Você constrói peças de madeira para casas e prédios, como portas, janelas e escadas, com encaixes firmes e precisos feitos a partir de desenhos e cálculos.",
    tracos: ["Visão espacial", "Precisão", "Força com cuidado"],
    link: "https://worldskills.org/skills/id/237/",
    prova: {
      resumo: "Faz portas, janelas e escadas de madeira para prédios. Trabalha mais na oficina e às vezes instala na obra.",
      pesos: [["Encaixes, como o rabo de andorinha", 20], ["Qualidade do trabalho", 20], ["Montagem e instalação", 15]],
      destaque: "Não é só trabalho manual: também usa programas de desenho e de projeto de construção (CAD e BIM)." },
    procurar: "Gilson Oliveira",
    midia: null, depoimento: null },
  quim: { nome: "Tecnologia Laboratorial Química", codigo: "#52", idade: "até 20 anos em 2028", idadeMax: 20, en: "Chemical Laboratory Technology",
    texto: "Você trabalha num laboratório analisando amostras: prepara soluções, faz análises químicas e com equipamentos, calcula os resultados e segue normas de qualidade e segurança à risca.",
    tracos: ["Rigor", "Curiosidade científica", "Organização"],
    link: "https://worldskills.org/skills/id/544/",
    prova: {
      resumo: "Analisa amostras para descobrir do que são feitas e em que quantidade. Trabalha em laboratórios de controle de qualidade, pesquisa ou meio ambiente, em indústrias como a farmacêutica, a de alimentos e a de petróleo.",
      pesos: [["Técnicas de laboratório, como titulação, destilação e cromatografia", 35], ["Interpretar e avaliar os resultados", 15], ["Máquinas de laboratório automatizadas", 10]],
      destaque: "Tem um lado bem tecnológico: 10% da nota é sobre máquinas de laboratório automatizadas." },
    procurar: "Sandra de Cassia",
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
  { id: "q1", q: "Num trabalho em grupo, qual parte você pega?", o: {
    game:   "A parte visual: desenhos, capa e ilustrações",
    app:    "Pensar em como o público vai entender melhor",
    web:    "Montar a planilha ou o sistema que organiza tudo",
    ctrl:   "Definir o que acontece primeiro, depois e por último",
    elet:   "Conferir cada detalhe para não ter nenhum erro",
    mec:    "Fazer a maquete funcionar de verdade, com motor e tudo",
    i40:    "Juntar a parte de todo mundo e ver o que dá para melhorar",
    prod:   "Rabiscar como a ideia ficaria se fosse um produto",
    mecind: "Resolver quando alguma coisa emperra ou quebra",
    cad:    "Fazer o desenho com todas as medidas certas",
    movel:  "Cuidar do acabamento para tudo ficar bonito",
    marc:   "Montar a estrutura que deixa tudo firme",
    quim:   "Testar, medir e anotar os resultados com cuidado" } },
  { id: "q2", q: "No tempo livre, o que você mais curte fazer?", o: {
    game:   "Desenhar personagens ou criar mundos",
    app:    "Testar apps novos e pensar no que dava para melhorar",
    web:    "Fuçar no computador até entender como funciona por trás",
    ctrl:   "Desafios de lógica e quebra-cabeças",
    elet:   "Ajudar em casa com tomada, lâmpada ou chuveiro",
    mec:    "Montar kits de robótica ou carrinhos que andam sozinhos",
    i40:    "Jogos de estratégia em que você administra uma cidade",
    prod:   "Inventar e construir coisas com papelão ou sucata",
    mecind: "Mexer em motor de moto, bicicleta ou carro",
    cad:    "Desenhar projetos e plantas com tudo medido",
    movel:  "Reformar ou customizar móveis e objetos de casa",
    marc:   "Construir coisas de madeira, como uma prateleira",
    quim:   "Fazer experiências misturando coisas para ver o que acontece" } },
  { id: "q3", q: "Você ganhou um presente. Qual escolhe?", o: {
    game:   "Uma mesa digitalizadora para desenhar",
    app:    "Um curso para criar meu próprio aplicativo",
    web:    "Um curso para criar meu próprio site",
    ctrl:   "Um kit de motores e sensores para automatizar coisas",
    elet:   "Um kit de energia solar para montar",
    mec:    "Um robô para montar e programar",
    i40:    "Um kit para conectar aparelhos e ver os dados no celular",
    prod:   "Uma impressora 3D para criar objetos",
    mecind: "Um motor antigo para desmontar e restaurar",
    cad:    "Um programa profissional de projeto 3D",
    movel:  "Ferramentas para fazer meus próprios móveis",
    marc:   "Material para construir uma casa na árvore",
    quim:   "Um kit de química com vidrarias de laboratório" } },
  { id: "q4", q: "Você se considera uma pessoa mais…", o: {
    game:   "Criativa, com muita imaginação",
    app:    "Empática, que pensa em quem vai usar",
    web:    "Focada, que resolve um problema de cada vez",
    ctrl:   "Lógica e metódica",
    elet:   "Cuidadosa e responsável",
    mec:    "Versátil, que gosta de mexer em várias coisas",
    i40:    "Estratégica, que enxerga o todo",
    prod:   "Inventiva, sempre pensando em como melhorar as coisas",
    mecind: "Persistente, que não larga até funcionar",
    cad:    "Precisa, que confere cada medida",
    movel:  "Caprichosa, que gosta de coisa bem-feita",
    marc:   "Prática, que gosta de ver a coisa firme e de pé",
    quim:   "Investigadora, que testa até ter certeza" } },
  { id: "q5", q: "Como seria o seu trabalho ideal?", o: {
    game:   "Dando vida a personagens e cenários",
    app:    "Criando soluções que as pessoas usam no dia a dia",
    web:    "Fazendo os sistemas funcionarem por trás das telas",
    ctrl:   "Programando máquinas para trabalharem sozinhas",
    elet:   "Levando energia com segurança para casas e empresas",
    mec:    "Montando e programando máquinas automáticas",
    i40:    "Usando dados para uma fábrica produzir mais e melhor",
    prod:   "Inventando produtos que vão ser fabricados aos milhares",
    mecind: "Mantendo máquinas grandes funcionando numa fábrica",
    cad:    "Projetando peças no computador antes de elas existirem",
    movel:  "Transformando madeira em móveis numa oficina",
    marc:   "Construindo portas, janelas e escadas de madeira",
    quim:   "Analisando amostras para descobrir do que são feitas" } },
  { id: "q6", q: "O que te deixaria mais orgulhoso no fim do dia?", o: {
    game:   "Ver um personagem que eu desenhei ganhar vida",
    app:    "Alguém dizer que o que eu fiz facilitou a vida dele",
    web:    "Um sistema meu aguentar muita gente usando sem travar",
    ctrl:   "Algo que eu fazia na mão passar a acontecer sozinho",
    elet:   "Ligar a energia e tudo funcionar de primeira, sem risco",
    mec:    "Uma máquina que eu montei e programei fazer tudo sozinha",
    i40:    "Mostrar com números que a produção melhorou",
    prod:   "Ver uma ideia minha virar algo que as pessoas usam",
    mecind: "Uma máquina parada voltar a funcionar por minha causa",
    cad:    "Um projeto meu virar uma peça que encaixa perfeitamente",
    movel:  "Um móvel que eu fiz ficar com acabamento de loja",
    marc:   "Uma estrutura que eu montei aguentar firme",
    quim:   "Descobrir exatamente o que tinha numa amostra" } },
  { id: "q7", q: "Qual frase mais combina com você?", o: {
    game:   "Eu imagino tudo antes de desenhar",
    app:    "Isso podia ser mais fácil de usar",
    web:    "Deixa que eu descubro por que não está funcionando",
    ctrl:   "Cada coisa no seu lugar e na hora certa",
    elet:   "Melhor prevenir do que remediar",
    mec:    "Dá para automatizar isso",
    i40:    "Tudo está conectado",
    prod:   "Isso podia ter um formato melhor",
    mecind: "Se tem um barulho estranho, eu acho de onde vem",
    cad:    "Antes de fazer, eu desenho",
    movel:  "O acabamento faz toda a diferença",
    marc:   "Meça duas vezes, corte uma",
    quim:   "Tudo tem uma explicação" } },
  { id: "q8", q: "Na escola, qual tarefa você pegaria com mais vontade?", o: {
    game:   "Fazer as ilustrações do trabalho",
    app:    "Criar uma pesquisa para saber o que a turma precisa",
    web:    "Montar a página do projeto na internet",
    ctrl:   "Resolver os exercícios de lógica",
    elet:   "Montar o circuito na aula de física",
    mec:    "Construir o robô da feira de ciências",
    i40:    "Organizar os dados e os gráficos do trabalho",
    prod:   "Criar a maquete do produto",
    mecind: "Consertar o que quebrou na sala",
    cad:    "Fazer a planta em escala, com todas as medidas",
    movel:  "Fazer a estante do cenário da peça de teatro",
    marc:   "Montar a estrutura de madeira do estande",
    quim:   "Fazer o experimento da aula de química" } },
  { id: "q9", q: "Na feira de profissões, em qual estande você para primeiro?", o: {
    game:   "O de jogos, com personagens criados em 3D",
    app:    "O de aplicativos que resolvem problemas da cidade",
    web:    "O de sites e sistemas que funcionam na nuvem",
    ctrl:   "O de painéis que comandam máquinas sozinhas",
    elet:   "O de energia solar e carro elétrico",
    mec:    "O de robôs e máquinas automáticas",
    i40:    "O da fábrica inteligente, com tudo conectado",
    prod:   "O de produtos inovadores e sustentáveis",
    mecind: "O de máquinas industriais gigantes",
    cad:    "O de projetos de engenharia em 3D",
    movel:  "O de móveis planejados",
    marc:   "O de casas e estruturas de madeira",
    quim:   "O de laboratório, com experimentos ao vivo" } },
  { id: "q10", q: "Quando alguma coisa não funciona, qual é o seu primeiro impulso?", o: {
    game:   "Imaginar uma versão nova e mais bonita",
    app:    "Pensar em como deixar mais fácil de usar",
    web:    "Procurar o erro passo a passo até achar",
    ctrl:   "Ver em que etapa da sequência deu errado",
    elet:   "Desligar tudo e checar se está seguro",
    mec:    "Abrir para ver a parte mecânica e a eletrônica",
    i40:    "Olhar os dados para entender o que mudou",
    prod:   "Pensar em como redesenhar para não quebrar mais",
    mecind: "Pegar as ferramentas e consertar na hora",
    cad:    "Medir a peça quebrada para fazer uma nova igual",
    movel:  "Ajustar e lixar até ficar como novo",
    marc:   "Reforçar a estrutura para aguentar mais",
    quim:   "Investigar o que causou o problema" } }
];

/* Perguntas "isso ou aquilo": separam perfis parecidos.
   Este é um banco de duelos: a cada jogo são sorteados 4, dando prioridade às modalidades que apareceram menos.
   Eles aparecem intercalados com as perguntas de múltipla escolha. Toda modalidade deve estar em pelo menos 2 duelos. */
const DUELOS = [
  { id: "d1", q: "Num app de delivery, qual parte você ia gostar mais de fazer?", o: {
    app: "A tela em que a pessoa escolhe e pede com dois toques",
    web: "O sistema por trás, que recebe os pedidos e guarda tudo" } },
  { id: "d2", q: "Uma esteira da fábrica parou. Você prefere…", o: {
    mec:  "Ir até a máquina e achar o defeito na mecânica ou no programa",
    ctrl: "Ir ao painel de comando e descobrir qual etapa falhou" } },
  { id: "d3", q: "Você prefere que as coisas que você cria…", o: {
    game: "Existam num mundo digital, onde tudo é possível",
    prod: "Existam no mundo real, para alguém pegar na mão" } },
  { id: "d4", q: "Num prédio novo, você preferiria…", o: {
    elet: "Deixar toda a instalação elétrica pronta e segura",
    i40:  "Ligar os equipamentos numa rede e acompanhar os dados" } },
  { id: "d5", q: "Com eletricidade, o que te atrai mais?", o: {
    ctrl: "Fazer um motor ligar, parar e inverter sozinho",
    elet: "Deixar a instalação de uma casa inteira segura e bem-feita" } },
  { id: "d6", q: "Num time de robótica, você seria quem…", o: {
    mec: "Monta e programa o robô",
    i40: "Conecta tudo e analisa os dados para o time decidir" } },
  { id: "d7", q: "Num jogo de celular, você repara mais…", o: {
    app:  "Se os menus e botões são fáceis de usar",
    game: "No visual dos personagens e cenários" } },
  { id: "d8", q: "Num projeto novo, você gosta mais de…", o: {
    web:  "Programar a parte que faz tudo funcionar",
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
    mec:    "Montar e programar máquinas automáticas" } },
  { id: "d14", q: "Você prefere criar…", o: {
    movel: "Um móvel de verdade, feito à mão",
    prod:  "Um objeto que vai ser fabricado aos milhares" } },
  { id: "d15", q: "Numa casa em construção, você ficaria com…", o: {
    marc: "As portas, janelas e escadas de madeira",
    elet: "Toda a parte elétrica" } },
  { id: "d16", q: "Você prefere acompanhar…", o: {
    quim: "Os resultados das análises de um laboratório",
    i40:  "Os dados de uma fábrica inteira numa tela" } },
  { id: "d17", q: "Numa fábrica automatizada, você prefere cuidar…", o: {
    ctrl: "Do painel e da programação de cada máquina",
    i40:  "Da rede que conecta todas as máquinas e dos dados delas" } },
  { id: "d18", q: "Num projeto em 3D, você prefere…", o: {
    game: "Criar um personagem com cores e expressão",
    cad:  "Modelar uma peça com medidas exatas para fabricar" } }
];
/* ===================================================================== */
