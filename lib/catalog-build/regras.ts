// Regras de marca, abreviações e categorias do catálogo. Ver README (Atualizar o catálogo).

export const MARCAS: string[] = ["PORTO BRASIL", "SÃO MARCOS", "SAO MARCOS", "SAO DOMINGOS", "DANI FERNANDES", "VIA AROMA", "ARCO IRIS", "NOVA IMAGEM", "N JALICE", "LYOR", "ABC", "FLORARTE", "BRINOX", "YANGZI", "PARAMOUNT", "PLASUTIL", "TRAMONTINA", "JOLITEX", "BOLIVAR", "MUNDIAL", "BOT-ART", "BOTART", "KEHOME", "NITRON", "CLINK", "KAPAZI", "UNY", "COPOZAN", "ARQPLAST", "RNS", "TERMOLAR", "SANTANA", "REPETECO", "PREMISSE", "JALICE", "STOLF", "VASAP", "NOBRE", "BETTANIN", "MABRUK", "PRAFESTA", "HERCULES", "BSB", "MIMO", "MIALSKY", "ARTHI", "COPOPLAST", "EIRILAR", "INGA", "MB", "PLUMA", "WYDA", "GRILLO", "UZ", "BURGUINA", "TEXAS", "OFFICER", "MARTINAZZO", "KEITA", "SANCHES", "PLAZAPEL", "CROMUS", "TOYPLAST", "PLESTIN", "FORTINOX", "IRIL", "INVICTA", "PLASMONT", "NIQUELPLAST", "GRILAZER", "ELDORADO", "SKYMSEN", "ETILUX", "SUPERCRON", "SECALUX", "SCHMIDT", "VABENE", "UNITERMI", "HEMON", "KARSTEN", "UNINJET", "RISCHIOTO", "DARNEL", "BOREDA", "MARFINITE", "DAIWA", "ZEFFIA", "CLASSHOME", "EVO", "OXFORD", "NADIR", "CRISA", "MARINEX", "SANREMO", "ORDENE", "COZA", "PLASVALE", "GB", "DECOR", "DANI FERNAND", "D. FERNANDES", "OU", "KLIN", "YAGZI", "TAKENTE", "BENILDON", "1O CLASSIFIC."];
export const MARCA_NOME: Record<string, string> = {"BOTART": "Bot-Art", "BOT-ART": "Bot-Art", "SAO MARCOS": "São Marcos", "SÃO MARCOS": "São Marcos", "SAO DOMINGOS": "São Domingos", "N JALICE": "Jalice", "ABC": "ABC", "MB": "MB", "RNS": "RNS", "BSB": "BSB", "UZ": "UZ", "GB": "GB", "EVO": "EVO", "UNY": "Uny", "OU": "OU", "DANI FERNAND": "Dani Fernandes", "D. FERNANDES": "Dani Fernandes", "YAGZI": "Yangzi", "1O CLASSIFIC.": ""};
/** Abreviações do sistema (só quando terminam em ponto ou têm até 3 letras) */
export const ABREV: Record<string, string> = {"CX": "caixa", "ORG": "organizador", "PLAST": "plástico", "BCO": "branco", "BCA": "branca", "BC": "branco", "PT": "preto", "PTO": "preto", "VM": "vermelho", "AZ": "azul", "VD": "verde", "AM": "amarelo", "CZ": "cinza", "RS": "rosa", "TRANSP": "transparente", "DESC": "descartável", "INOX": "inox", "ALUM": "alumínio", "CERAM": "cerâmica", "PORC": "porcelana", "DECOR": "decorativo", "RET": "retangular", "RED": "redondo", "QUAD": "quadrado", "BAND": "bandeja", "EMB": "embalagem", "IND": "industrial", "GASTR": "gastronômico", "ESPEC": "especial", "POLIET": "polietileno", "CROM": "cromado", "MAD": "madeira", "ACRIL": "acrílico", "TP": "tampa", "REF": "refil", "UN": "unidade", "UNID": "unidades", "PCT": "pacote", "DIAM": "diâmetro", "ALT": "altura", "LARG": "largura", "COMP": "comprimento", "P": "para", "C": "com", "S": "sem", "ELET": "elétrico", "AUT": "automático", "INF": "infantil", "PEQ": "pequeno", "MED": "médio", "GDE": "grande", "GD": "grande", "LIQ": "líquido", "TROP": "tropical", "S.MESA": "sobremesa", "ESTAMP": "estampado", "ELAST": "elástico", "ANTIAD": "antiaderente", "ANTIADER": "antiaderente", "INOXID": "inoxidável", "TRAD": "tradicional", "TERM": "térmico", "SILIC": "silicone", "VIDR": "vidro", "DOUR": "dourado", "PRAT": "prateado"};
/** Palavras sem acento no cadastro */
export const ACENTOS: Record<string, string> = {"XICARA": "xícara", "XICARAS": "xícaras", "TACA": "taça", "TACAS": "taças", "CACAROLA": "caçarola", "CERAMICA": "cerâmica", "PLASTICO": "plástico", "PLASTICA": "plástica", "ALUMINIO": "alumínio", "ACRILICO": "acrílico", "ACRILICA": "acrílica", "TERMICA": "térmica", "TERMICO": "térmico", "AGUA": "água", "CAFE": "café", "CHA": "chá", "ACUCAREIRO": "açucareiro", "ACO": "aço", "TABUA": "tábua", "ESPATULA": "espátula", "SANITARIA": "sanitária", "PRESSAO": "pressão", "PAO": "pão", "MAO": "mão", "PAPELAO": "papelão", "PECAS": "peças", "PECA": "peça", "POLIESTER": "poliéster", "DIAMETRO": "diâmetro", "UTENSILIOS": "utensílios", "UTENSILIO": "utensílio", "MULTIUSO": "multiuso", "ACUCAR": "açúcar", "LIMAO": "limão", "ORGANIZACAO": "organização", "DECORACAO": "decoração", "ESCORREDOR": "escorredor", "LIQUIDO": "líquido", "HIGIENICO": "higiênico", "SABAO": "sabão", "PA": "pá", "RAMEQUIM": "ramequim", "PIRES": "pires", "PORCAO": "porção", "BALAO": "balão", "CORACAO": "coração", "ESTRELA": "estrela", "METALICO": "metálico", "METALICA": "metálica", "ELETRICO": "elétrico", "ELETRICA": "elétrica", "LAMPADA": "lâmpada", "ARVORE": "árvore", "GUARDANAPO": "guardanapo", "PE": "pé", "RETANGULAR": "retangular", "VIDRO": "vidro", "BAU": "baú", "CABECA": "cabeça", "DESCARTAVEL": "descartável", "DESCARTAVEIS": "descartáveis", "GARCOM": "garçom", "PINCA": "pinça", "ESPAGUETE": "espaguete", "MANTEIGUEIRA": "manteigueira", "FRUTEIRA": "fruteira", "LIXEIRA": "lixeira", "MOVEL": "móvel", "UTIL": "útil", "PORTATIL": "portátil", "HERMETICO": "hermético", "HERMETICA": "hermética", "ALCA": "alça", "ALCAS": "alças", "SINALIZACAO": "sinalização", "CALDEIRAO": "caldeirão", "MAQUINA": "máquina", "ESSENCIA": "essência", "ORGANICO": "orgânico", "ORGANICA": "orgânica", "IMPERMEAVEL": "impermeável", "LACO": "laço", "LACOS": "laços", "CLASSICA": "clássica", "CLASSICO": "clássico", "TENIS": "tênis", "FAMILIA": "família", "VALVULA": "válvula", "ALGODAO": "algodão", "CORDAO": "cordão", "CHAO": "chão", "ORQUIDEA": "orquídea", "SAO": "são", "LTS": "L", "LT": "L", "TPA": "tampa", "PCS": "peças", "PC": "peça", "CBO": "cabo", "SACHE": "sachê", "PRATICO": "prático", "PRATICA": "prática", "RUSTICO": "rústico", "RUSTICA": "rústica", "UNICO": "único", "JAPONES": "japonês", "FACIL": "fácil", "FEIJAO": "feijão", "BOTAO": "botão", "FRANCES": "francês", "FRANCESA": "francesa", "AMBAR": "âmbar", "OCULOS": "óculos", "CUBICO": "cúbico", "BASICO": "básico", "BASICA": "básica", "ECOLOGICO": "ecológico", "HIGIENICA": "higiênica", "GIRATORIO": "giratório", "GIRATORIA": "giratória", "ACESSORIO": "acessório", "ACESSORIOS": "acessórios", "LIQUIDA": "líquida", "ANTIADERENTE": "antiaderente", "ESPATULAS": "espátulas", "ACOUGUE": "açougue", "PESSEGO": "pêssego", "CERAMICO": "cerâmico", "PORTUGUES": "português", "METALIZADO": "metalizado", "VOLUMETRICO": "volumétrico", "ESTANTE": "estante", "DIGITOS": "dígitos", "PRECOS": "preços", "PRECO": "preço", "DECORATIVA": "decorativa", "INFLAVEL": "inflável", "MACARRAO": "macarrão", "DOMINO": "dominó", "EXTENSAO": "extensão", "PROTECAO": "proteção", "CONSERVACAO": "conservação", "CONFEITARIA": "confeitaria", "TERMOMETRO": "termômetro", "REFRATARIO": "refratário", "SAUDE": "saúde", "LUMINARIA": "luminária", "ROSTO": "rosto", "PRESENCA": "presença", "LAMINA": "lâmina", "LAMINAS": "lâminas", "ELETRICOS": "elétricos", "ESPECIFICO": "específico", "TRIPE": "tripé", "CAPSULA": "cápsula", "CAPSULAS": "cápsulas", "OLEO": "óleo", "ALCOOL": "álcool", "AUTOMATICO": "automático"};
export const PEQUENAS = new Set<string>(["a", "com", "da", "das", "de", "do", "dos", "e", "em", "o", "ou", "para", "sem"]);
/** Itens que não aparecem no site (decisão da empresa) */
export const EXCLUIR: RegExp[] = [
  new RegExp("SAPATO SOCIAL"),
  new RegExp("OLEO 10W40"),
  new RegExp("CREME P/ ?MAOS"),
  new RegExp("PINCA DEPILAT"),
  new RegExp("LIVRO DIGITA"),
  new RegExp("EXPOSITOR BONIFIC"),
  new RegExp("KIT 175 CADCAIXA"),
  new RegExp("^MOUSE"),
  new RegExp("TECLADO"),
  new RegExp("^TONER"),
  new RegExp("FONE OUVIDO"),
  new RegExp("CARREGADOR TURBO"),
  new RegExp("CABO DE REDE"),
  new RegExp("CABO DE GRAVADOR"),
  new RegExp("CLIPS PAPEL"),
  new RegExp("^CORRETIVO"),
  new RegExp("MARCA TEXTO"),
  new RegExp("MARCADORES ADESIVOS"),
];
/** Reclassificações: regex na descrição original -> [categoria, subcategoria]. A primeira que casar vence. */
export const AJUSTES: [RegExp, string, string][] = [
  [new RegExp("FERTILIZ|SUBSTRATO|TERRA VEGETAL|ARGILA EXPAND|ADUBO|CONDICIONADOR DE SOLO|ESTERCO|CASCA DE PINUS|CASCA PINUS"), "Jardinagem", "Adubos e substratos"],
  [new RegExp("^SACHO|JARDINAGEM|LIMA PARA ENXADA|ENXADA|ANCINHO|TESOURA.*PODA|PAZINHA(?!.*DESC)"), "Jardinagem", "Ferramentas de jardim"],
  [new RegExp("^(?!.*GAS)(?=.*(\\bREGADOR|MANGUEIRA|ESGUICHO|HIDROPISTOLA|ASPERSOR|^PULVERIZADOR|^BORRIFADOR))"), "Jardinagem", "Rega"],
  [new RegExp("^(VASO|CACHEPO|JARDINEIRA)\\b(?!.*(VIDRO|CRISTAL|MURANO|PORC|ESPELH|METAL|DOURAD|PRATEAD))(?=.*(PLAST|BARRO|CIMENTO|POLIET|AUTO.?IRRIG|ARGILA|TERRACOTA|FIBRA|RESINA|COCO|JARDIM|ROTOMOLD|POLIPROP|MADEIRA))"), "Jardinagem", "Vasos e jardineiras"],
  [new RegExp("^JARDINEIRA|PRATO P/ ?VASO|PRATO PARA VASO|SUPORTE P/ ?VASO|FLOREIRA"), "Jardinagem", "Vasos e jardineiras"],
  [new RegExp("SAMAMBAIA|SUCULENTA|GRAMA SINT|MINI ROSA|HASTE SEMENTE|SEMENTE DRACENA|FOLHAGEM|PLANTA ART|^C\\.SEMENTE|^C\\.TRIGO|^C\\.GYPSO|^H\\.MUM|FLORES LAVANDA|ORQUIDEA"), "Jardinagem", "Plantas artificiais"],
  [new RegExp("^(VASO|CACHEPO).*(VASAP)|^VASO (CONE|RECONCAVO|VIETNAMITA|THAI|HANAZAKI)"), "Jardinagem", "Vasos e jardineiras"],
  [new RegExp("FESTAO|GUIRLANDA|AZEVINHO|ESTRELA FILIGRANA|BONECO NEVE|BOLA MISTA"), "Natal", "Decoração de Natal"],
  [new RegExp("GUARDA CHUVA|SOMBRINHA|CAPA (DE )?CHUVA"), "Lazer, Infantil e Pet", "Chuva"],
  [new RegExp("PISCINA|^BOIA|OCULOS NATACAO|BARRACA|COOLER|BOLSA TERMICA|CANTIL|CX\\. PLAST\\. TERMICA"), "Lazer, Infantil e Pet", "Lazer e camping"],
  [new RegExp("INFANTIL|LANCHEIRA|SHAKEIRA|SQUEEZE|GARRAGA"), "Lazer, Infantil e Pet", "Infantil"],
  [new RegExp("DOMINO|POKER"), "Lazer, Infantil e Pet", "Jogos"],
  [new RegExp("COMEDOURO|AQUARIO|BEBEDOURO PET|PET "), "Lazer, Infantil e Pet", "Pet"],
  [new RegExp("^(CADEIRA|MESA) PLAST|POLTRONA|MESA MADEIRA P/NOTEBOOK"), "Lazer, Infantil e Pet", "Móveis"],
  [new RegExp("SAPATO BORRACHA|TENIS PVC|PROTETOR FACIAL|^TOUCA|^AVENTAL"), "Linha Industrial", "Calçados e EPI"],
  [new RegExp("^CUBA GN|ESTOJO FRANGO|^ESTRADO|^EXPOSITOR|^ETIQUETA ETIQ|ETIQUETADORA|^ETQ GOND|CAMPAINHA INOX P/BALCAO|PENTE OVOS|DESCAMADOR|CUSCUZEIRO.*IND"), "Linha Industrial", "Food service e loja"],
  [new RegExp("SACHE C/|SACHE \\d|MAIONESE SACHE|MOSTARDA PREDILECTA|SACARINA|ADOC |^CAFE |MOLHO PIMENTA|ACUCAR"), "Embalagens e Descartáveis", "Sachês e alimentos"],
  [new RegExp("^LACO PRESENTE|PAPEL SEDA|PAPEL PRESENTE|^CX PAPEL|^CAIXA PAPEL|CAIXOTE CARTAO|CX PRESENTE|^CX RET|FITA ARAMADA|FITA DECORATIVA|^FITILHO|PALHA DE PAPEL|FIO DE PAPEL|CAIXA LIVRO PAPEL"), "Embalagens e Descartáveis", "Presentes"],
  [new RegExp("^CANETA|GRAMPEADOR"), "Casa e Ferramentas", "Papelaria"],
  [new RegExp("CUSCUZEIRO|PAELLA|OMELETEIRA|PANQUEQUEIRA|MOQUEQUEIRA|TAPIOQUEIRA|PANELINHA|MORINGA ALUM|MERENDEIRA"), "Panelas", "Panelas e frigideiras"],
  [new RegExp("^CHAPA FERRO|BISTEQUEIRA|KIT CHURRASCO|JG CHURRASCO|ESPATULA.*CHURRASCO|ESPÁTULA.*CHURRASCO|RASTELO.*BRASA|CARRINHO P/CHURRASCO|MESA DESMONTAVEL P/ CHURRASCO|CELOFANE.*CHURR|APOIO.*ESPETO|MISTEIRA"), "Utensílios de Cozinha", "Churrasco"],
  [new RegExp("MANTEGUEIRA|MANTEIGUEIRA|VINAGREIRO|AZEITEIRO|SUQUEIRA|LICOREIRA|RAMEQUIN|SALADEIRINHA|SOUSPLAST|CAMINHO.*MESA|LUGARES AMERICANOS|CJ VIDRO S\\.MESA|CONJ\\. P/SOBREMESA|TRAV OVAL|TULIPA|TAÇA|CJ 6PCS P/SUSHI|BARCO P/SUSHI|MELEIRA|CUIA|MORINGA BARRO|PAPA BOLINHA|NIVELADOR.*MESA"), "Mesa Posta", "Acessórios de mesa"],
  [new RegExp("FONDUE|FOUNDUE|RECHAUD"), "Mesa Posta", "Fondue e rechaud"],
  [new RegExp("CAIPIRINHA|MEXEDOR P/DRINK|ADEGA|CUBO DE GELO|VINHO KIT|LATA P/BEBIDAS"), "Mesa Posta", "Bar e drinks"],
  [new RegExp("^PLASTICO ESTAMP|^PLASTICO ALKOTERM|^PLASTICO LISO|^PLASTICO TRANSP"), "Mesa Posta", "Toalhas e plástico por metro"],
  [new RegExp("^BISNAGA|MACHO P/CORT|^CONJ\\. NAV|MOLA CAVALO|CILINDRO MANUAL|MOLDE PARA PASTEL|^PINCA INOX|TIMER COZINHA|TEMPORIZADOR|INFUSOR|TELA PROTETORA|TRITURADOR|SECA SALADAS|QUEBRA NOZES|MACARICO|PRENSA P/HAMB|PEDRA AMOLAR|BASE P/PEDRA|DECORADOR|REMOVEDOR CAROCO|INJETOR|PLAINA QUEIJO|PASSADOR|LAVADOR ARROZ|GRADE ANTI|KIT CAPSULA P/SIFAO|CUTELO|CONSERVADORA|HAMBURGUEIRA|ANEL VEDACAO|ASA CORPO|LAVA TUDO|BOMBA.*GALAO|MINI BOMBA|CAPA GALAO|BARRIL"), "Utensílios de Cozinha", "Utensílios de cozinha"],
  [new RegExp("PRENDEDOR|CAPA P/MAQUINA DE LAVAR|FORRO TERMICO P/PASSAR|ESFERA P/LAVAR|ESCOVA PLAST\\. P/ ROUPA|CARRO FUNCIONAL"), "Limpeza e Higiene", "Lavanderia"],
  [new RegExp("^ESCOVA|^FIBRA LIMPEZA|PALHA DE ACO|LA DE ACO|^CABO |CABO EXTENSOR|DESENCRUST|DESENGORD|SODA CAUSTICA|ACIDO MURIATICO|CERA LIQUIDA|LUSTRA MOV|OLEO DE PEROBA|REMOVEDOR REMOVE|DISCO 350|INSET|REPELENTE|RAQUETE.*ELETRICA|VENTILADOR.*INSETO|ESPANADOR|RODINHO|ESFREGADEIRA|APLICADOR GEL|TELA ODORIZANTE|PURIF\\.AR|LIMP MULT|PASTA CRISTAL|BUCHA VEGETAL|PASSADOR DE CERA|ESPUMA PEDREIRO"), "Limpeza e Higiene", "Limpeza e higiene"],
  [new RegExp("AGUA PERF|AGUA DE PASSAR|DIF\\. DE VARETAS|OLEO ESSENCIAL|OLEO VEGETAL CARREADOR|^SACHE|HOME SPRAY|MOSTRUARIO|PROVADOR"), "Decoração", "Aromas e velas"],
  [new RegExp("ESCULTURA|ESCUTLURA|AFRICANA|CABECA AFRICANA|TIGRE DECOR|CORACAO CERAMICA|SANTA CRISTAL|ANJO CRISTAL|CINZEIRO|AMPULHETA|ORATORIO|PAINEL FOTOS|RELOGIO|FONTE DECORATIVA|LUZ NOTURNA|FIO DE FADA|CAIXA DECORATIVA|CX DECOR|LATA DECOR|PESO AMBAR|PASSARO CERAMICA|MENINA LENDO|TRILHO PLASTICO|IMA |TUBO VIDRO"), "Decoração", "Objetos decorativos"],
  [new RegExp("^CESTA|^CESTINHA|GUARDA TUDO|^MALETA|FRASQUEIRA|ETIQUETAS (CLOSET|DESPENSA|TEMPEROS)|CANTONEIRA|COOK HOME|KIT COZINHA CROMADO|BARRA CROMADA|NECESSAIRE|KIT 3 FRASCOS|KIT COSTURA|ORG 1\\.0L|MANCEBO|CARRETILHA|LACRE PLAST|CARRINHO COMPRAS|RODA P/CARRINHO|CAIXA FERRAMENTA"), "Organização", "Caixas e organizadores"],
  [new RegExp("PAPEL MANTEIGA"), "Utensílios de Cozinha", "Utensílios de cozinha"],
  [new RegExp("BASE P/ CAFE"), "Embalagens e Descartáveis", "Copos, pratos e talheres descartáveis"],
  [new RegExp("BASTAO MADEIRA CAIPIRA"), "Mesa Posta", "Bar e drinks"],
  [new RegExp("^CARTAO -"), "Embalagens e Descartáveis", "Presentes"],
  [new RegExp("^HF\\.PAO"), "Decoração", "Objetos decorativos"],
  [new RegExp("PAPEL P/GAVETA"), "Organização", "Caixas e organizadores"],
  [new RegExp("AREJADOR|ACABAMENTO|ASSENTO SANITARIO|PAPELEIRA|KIT QUADRA|KIT JUNIOR|VALVULA GATILHO|BANHEIRA"), "Casa e Ferramentas", "Hidráulica"],
  [new RegExp("^PINO |ADAPTADOR|PLAFONIER|CAMPAINHA SEM FIO|ISQUEIRO|FOGAREIRO|EBULIDOR"), "Casa e Ferramentas", "Elétrica"],
  [new RegExp("^FITA |FITA CREPE|FITA DUPLA|VEDA ROSCA|TELA ANTIDERRAP"), "Casa e Ferramentas", "Fitas e fixação"],
  [new RegExp("FELTRO|PROTETOR ANTIRISCO|PROTECAO P/ PE MOVEIS|RODINHAS|PROTETOR VEDA|PROTETOR P/PIA|KIT 02PCS TRAVAS|CAPA COLCHAO|CAPA P/BOTIJAO|CAPA CABELEIREIRO|CARA BRANCA"), "Casa e Ferramentas", "Proteção e acabamento"],
  [new RegExp("PARAFUSADEIRA|JG FERRAMENTAS|ESTILETE|CANIVETE|CORDA DE JUTA|BARBANTE|CONE RETRATIL|PRTAO"), "Casa e Ferramentas", "Ferramentas e sinalização"],
];
