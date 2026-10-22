"""Gera os dados do catálogo do site a partir das listas de produtos da Querino.

Uso (na raiz do repositório):
    python3 scripts/catalogo/gerar_site.py caminho/lista-produtos-BH.csv caminho/lista-produtos-LS.csv

Saídas:
    data/catalogo/produtos.json    — produtos do site (nome, descrição, especificações, categoria, índice de busca)
    data/catalogo/categorias.json  — subcategorias de cada categoria com a contagem de produtos

As listas da Querino não vão para o repositório (têm preço e estoque). Nada aqui altera o sistema da Querino.
"""
import json, os, re, sys, unicodedata
sys.path.insert(0, os.path.dirname(__file__))
from classificar import classificar

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SAIDA = os.path.join(RAIZ, 'data', 'catalogo')

# Categoria do site -> slug (a ordem aqui é a ordem de exibição)
CATEGORIAS = [
    ('Embalagens e Descartáveis', 'embalagens-e-descartaveis'),
    ('Utensílios de Cozinha', 'utensilios-de-cozinha'),
    ('Panelas', 'panelas'),
    ('Organização', 'organizacao'),
    ('Limpeza e Higiene', 'limpeza-e-higiene'),
    ('Mesa Posta', 'mesa-posta'),
    ('Decoração', 'decoracao'),
    ('Linha Industrial', 'linha-industrial'),
    ('Jardinagem', 'jardinagem'),
    ('Casa e Ferramentas', 'casa-e-ferramentas'),
    ('Cama, Mesa e Banho', 'cama-mesa-e-banho'),
    ('Lazer, Infantil e Pet', 'lazer-infantil-e-pet'),
    ('Natal', 'natal'),
]
CAT_SLUG = dict(CATEGORIAS)

# Texto de uso por subcategoria (primeira frase da descrição)
USO = {
    'Banho e enxoval': 'Item para deixar o banheiro e a rotina da casa mais organizados e confortáveis.',
    'Elétrica': 'Item elétrico para pequenas instalações, reparos e uso no dia a dia da casa ou do comércio.',
    'Ferramentas e sinalização': 'Item para manutenção, pequenos reparos e sinalização de casas, empresas e condomínios.',
    'Fitas e fixação': 'Solução prática para fixar, vedar e fazer acabamentos em casa ou no trabalho.',
    'Hidráulica': 'Peça para cozinha, banheiro e área de serviço, útil em instalações e na manutenção do dia a dia.',
    'Papelaria': 'Item de papelaria para o escritório, a escola e a rotina da loja.',
    'Proteção e acabamento': 'Protege móveis, pisos e superfícies e ajuda a conservar a casa por mais tempo.',
    'Aromas e velas': 'Perfuma e deixa os ambientes mais acolhedores, ótimo também para presentear.',
    'Objetos decorativos': 'Peça decorativa para dar personalidade a salas, quartos e mesas.',
    'Têxteis e tapetes': 'Traz conforto e acabamento à decoração, combinando com diferentes estilos de ambiente.',
    'Vasos e plantas': 'Peça decorativa para compor ambientes com arranjos, flores e plantas.',
    'Copos, pratos e talheres descartáveis': 'Descartável prático para festas, eventos, lanchonetes, restaurantes e o dia a dia da empresa.',
    'Marmitas e potes': 'Embalagem para delivery, marmitas, doces e salgados, prática para quem produz e vende alimentos.',
    'Papel, filmes e outros': 'Item de embalagem e uso diário para cozinhas, comércios e eventos.',
    'Presentes': 'Para embrulhar e apresentar presentes com capricho, em casa ou na sua loja.',
    'Sachês e alimentos': 'Porção individual prática para restaurantes, lanchonetes, hotéis e eventos.',
    'Sacos e sacolas': 'Para embalar, transportar e armazenar com praticidade no comércio e em casa.',
    'Adubos e substratos': 'Nutre e prepara o solo para plantas mais saudáveis em vasos, hortas e jardins.',
    'Ferramentas de jardim': 'Ferramenta para cuidar de vasos, canteiros e jardins com mais facilidade.',
    'Plantas artificiais': 'Planta artificial que decora sem precisar de rega, ideal para ambientes internos.',
    'Rega': 'Para regar plantas, lavar áreas externas e cuidar do jardim com praticidade.',
    'Vasos e jardineiras': 'Vaso para cultivo de plantas, flores e temperos, dentro de casa ou na área externa.',
    'Chuva': 'Proteção prática para os dias de chuva.',
    'Infantil': 'Item pensado para a rotina das crianças em casa e na escola.',
    'Jogos': 'Diversão para reunir a família e os amigos.',
    'Lazer e camping': 'Para passeios, viagens, piscina e momentos de lazer.',
    'Móveis': 'Móvel prático para varandas, áreas de lazer, festas e comércios.',
    'Pet': 'Acessório para o dia a dia do seu animal de estimação.',
    'Lavanderia': 'Facilita a rotina de lavar, secar e cuidar das roupas.',
    'Limpeza e higiene': 'Para a limpeza e a higiene de casas, empresas e condomínios.',
    'Lixeiras': 'Ajuda a manter o descarte organizado em cozinhas, banheiros, escritórios e áreas comuns.',
    'Calçados e EPI': 'Proteção e segurança para quem trabalha em cozinhas, limpeza e áreas molhadas.',
    'Cozinha profissional': 'Linha resistente para restaurantes, escolas, hotéis e cozinhas de grande demanda.',
    'Food service e loja': 'Para organizar, expor e operar com eficiência em restaurantes e comércios.',
    'Acessórios de mesa': 'Complementa a mesa posta com praticidade e bom acabamento.',
    'Bar e drinks': 'Para preparar e servir drinks em casa, no bar ou em festas.',
    'Café e chá': 'Para preparar e servir café e chá no dia a dia ou ao receber visitas.',
    'Copos, taças e xícaras': 'Para servir bebidas no dia a dia e em ocasiões especiais.',
    'Fondue e rechaud': 'Para servir pratos quentes e reunir as pessoas em volta da mesa.',
    'Pratos e louças': 'Peça para o dia a dia ou para receber, que combina com diferentes composições de mesa.',
    'Talheres': 'Talher para refeições do dia a dia e para a mesa posta.',
    'Toalhas e plástico por metro': 'Revestimento para proteger e decorar mesas, vendido por metro ou em peças.',
    'Decoração de Natal': 'Decoração para deixar a casa, a loja ou a empresa no clima do Natal.',
    'Caixas e organizadores': 'Organiza armários, gavetas, despensas e ambientes, deixando tudo à vista e no lugar.',
    'Cestos': 'Cesto para organizar e decorar ao mesmo tempo, em qualquer ambiente da casa.',
    'Potes e mantimentos': 'Para guardar, conservar e organizar alimentos na despensa e na geladeira.',
    'Assadeiras e formas': 'Para assar bolos, tortas, pães e carnes em casa ou na produção de alimentos.',
    'Panelas e frigideiras': 'Panela para o preparo do dia a dia, em casa ou na cozinha profissional.',
    'Churrasco': 'Acessório para preparar e servir o churrasco.',
    'Confeitaria': 'Item de confeitaria para decorar e preparar bolos, doces e salgados.',
    'Eletroportáteis': 'Eletroportátil que agiliza o preparo de alimentos na cozinha.',
    'Facas e tábuas': 'Para cortar, fatiar e preparar alimentos com segurança e precisão.',
    'Utensílios de cozinha': 'Utensílio que facilita o preparo e o serviço de alimentos no dia a dia.',
}

MATERIAIS = [
    (r'\bACO INOX|\bINOX\b', 'aço inox'), (r'\bALUM\b|ALUM\.|ALUMINIO', 'alumínio'), (r'PORC\.|PORCELANA', 'porcelana'),
    (r'CERAM\.|CERAMICA|STONEWARE', 'cerâmica'), (r'CRISTAL', 'cristal'), (r'VIDRO', 'vidro'), (r'MELAMINA', 'melamina'),
    (r'SILICONE', 'silicone'), (r'ACRIL', 'acrílico'), (r'BAMBU|BAMBOO', 'bambu'), (r'MADEIRA|\bMAD\.', 'madeira'),
    (r'\bMDF\b', 'MDF'), (r'POLIET', 'polietileno'), (r'POLIPROP|\bPP\b', 'polipropileno'), (r'ISOPOR', 'isopor'),
    (r'KRAFT', 'papel kraft'), (r'PAPELAO', 'papelão'), (r'\bPVC\b', 'PVC'), (r'FERRO', 'ferro'), (r'ESMALTAD', 'metal esmaltado'),
    (r'ALGODAO', 'algodão'), (r'MICROFIBRA', 'microfibra'), (r'FIBRA NATURAL|RATTAN|JUTA|SISAL', 'fibra natural'),
    (r'POLIESTER', 'poliéster'), (r'\bTNT\b', 'TNT'), (r'BORRACHA', 'borracha'), (r'RESINA', 'resina'), (r'ARGILA|BARRO', 'argila'),
    (r'PLAST\.|PLASTICO|PLASTICA|\bPLAST\b', 'plástico'), (r'METAL', 'metal'),
]
CORES = [
    (r'\bPT\b|\bPTO\b|PRETO|PRETA|BLACK', 'preto'), (r'\bBCO\b|\bBCA\b|\bBC\b|BRANCO|BRANCA', 'branco'), (r'\bVM\b|VERMELH', 'vermelho'),
    (r'\bAZ\b|AZUL', 'azul'), (r'\bVD\b|VERDE', 'verde'), (r'\bCZ\b|CINZA', 'cinza'), (r'\bRS\b|ROSA\b|ROSE\b', 'rosa'),
    (r'\bAM\b|AMAREL', 'amarelo'), (r'DOURAD|\bOURO\b|GOLD', 'dourado'), (r'PRATEAD|\bPRATA\b', 'prateado'), (r'TRANSP', 'transparente'),
    (r'BEGE', 'bege'), (r'MARROM', 'marrom'), (r'NUDE', 'nude'), (r'MOSTARDA', 'mostarda'), (r'TERRACOTA|TERRA COTA', 'terracota'),
    (r'LARANJA', 'laranja'), (r'LILAS|ROXO|ROXA', 'roxo'), (r'COBRE', 'cobre'), (r'MARFIM', 'marfim'), (r'AREIA', 'areia'),
]

def norm(t):
    t = unicodedata.normalize('NFD', t)
    return ''.join(ch for ch in t if unicodedata.category(ch) != 'Mn').lower()

def slugify(t):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', norm(t))).strip('-')

def num_br(x):
    x = x.replace(',', '.')
    try:
        v = float(x)
    except ValueError:
        return x
    return (f'{v:.2f}'.rstrip('0').rstrip('.')).replace('.', ',')

def atributos(desc):
    d = re.sub(r'\*[^*]*\*?', ' ', desc.upper())
    a = {}
    m = re.search(r'(\d+[.,]?\d*)\s?X\s?(\d+[.,]?\d*)(?:\s?X\s?(\d+[.,]?\d*))?\s?(CM|MM|MTS|M)\b', d)
    if m:
        partes = [num_br(p) for p in m.groups()[:3] if p]
        un = {'MTS': 'm'}.get(m.group(4), m.group(4).lower())
        a['Medidas'] = ' x '.join(partes) + ' ' + un
    else:
        m = re.search(r'(?<![\d/.,])(\d+[.,]?\d*)\s?(CM|MM)\b', d)
        if m:
            a['Tamanho'] = f'{num_br(m.group(1))} {m.group(2).lower()}'
    m = re.search(r'(?<![\d/.,])(\d+[.,]?\d*)\s?(ML|LTS|LT|L)\b', d)
    if m:
        un = 'ml' if m.group(2) == 'ML' else 'L'
        a['Capacidade'] = f'{num_br(m.group(1))} {un}'
    m = re.search(r'(?<![\d/.,])(\d+[.,]?\d*)\s?(KG|GR|G)\b', d)
    if m:
        a['Conteúdo'] = f'{num_br(m.group(1))} {"kg" if m.group(2) == "KG" else "g"}'
    m = re.search(r'\b(127|220|110)\s?V\b|BIVOLT', d)
    if m:
        a['Voltagem'] = 'Bivolt' if 'BIVOLT' in m.group(0) else f'{m.group(1)} V'
    m = re.search(r'C/\s?(\d{2,5})\b(?!\s?(CM|MM|ML|L|LTS|KG|G)\b)', d)
    if m and int(m.group(1)) > 1:
        a['Embalagem'] = f'com {int(m.group(1)):,} unidades'.replace(',', '.')
    else:
        m = re.search(r'\b(\d{1,3})\s?(PCS|PECAS|PÇS)\b', d)
        if m and int(m.group(1)) > 1:
            a['Peças'] = f'{int(m.group(1))} peças'
    for p, nome in MATERIAIS:
        if re.search(p, d):
            a['Material'] = nome
            break
    for p, nome in CORES:
        if re.search(p, d):
            a['Cor'] = nome
            break
    return a

PARA_TIPO = {'Material', 'Cor'}

def tipo(nome, attrs):
    """Começo do nome que diz o que é o produto (ex.: 'Assadeira', 'Pote hermético')."""
    pare = {norm(attrs.get('Material', '')).split(' ')[-1], norm(attrs.get('Cor', '')), norm(attrs.get('Marca', '') or '#')}
    palavras = []
    for w in nome.split():
        nw = norm(w)
        if re.match(r'[\d"\'(-]', nw) or nw in pare or nw in {'aco', 'inox', 'aluminio', 'plastico', 'plastica', 'vidro', 'porcelana', 'ceramica', 'madeira', 'cristal', 'com', 'para', 'sem', 'em'}:
            break
        palavras.append(w)
        if len(palavras) == 4:
            break
    t = ' '.join(palavras) or nome.split()[0]
    return t[:1].upper() + t[1:].lower()

def descricao(nome, sub, attrs, marca):
    frases = []
    det = []
    if attrs.get('Material'):
        det.append(f'em {attrs["Material"]}')
    if attrs.get('Cor'):
        det.append(f'na cor {attrs["Cor"]}')
    if attrs.get('Capacidade'):
        det.append(f'com capacidade de {attrs["Capacidade"]}')
    if attrs.get('Medidas'):
        det.append(f'medindo {attrs["Medidas"]}')
    elif attrs.get('Tamanho'):
        det.append(f'com {attrs["Tamanho"]}')
    if det:
        txt = ', '.join(det[:-1]) + (' e ' if len(det) > 1 else '') + det[-1]
        frases.append(f'{tipo(nome, attrs)} {txt}.')
    frases.append(USO.get(sub, 'Produto disponível nas lojas Disk Marmitinha.'))
    if attrs.get('Embalagem'):
        frases.append(f'Vendido em embalagem {attrs["Embalagem"]}.')
    elif attrs.get('Peças'):
        frases.append(f'Conjunto com {attrs["Peças"]}.')
    if marca:
        frases.append(f'Produto da marca {marca}.')
    return ' '.join(frases)

def resumo(attrs, marca):
    for k in ('Embalagem', 'Capacidade', 'Medidas', 'Tamanho', 'Conteúdo', 'Peças'):
        if attrs.get(k):
            v = attrs[k]
            return ('Embalagem ' + v) if k == 'Embalagem' else v
    if attrs.get('Material'):
        return attrs['Material'].capitalize()
    return marca or 'Unidade'

def main(csv_bh, csv_ls):
    v, excl = classificar(csv_bh, csv_ls)
    os.makedirs(SAIDA, exist_ok=True)
    subs, out = {}, []
    for r in v.to_dict('records'):
        cat, sub = r['Categoria'], r['Subcategoria']
        if cat not in CAT_SLUG:
            continue
        nome, marca, desc = r['Nome sugerido'], r['Marca'], r['desc']
        attrs = atributos(desc)
        if marca:
            attrs['Marca'] = marca
        cs, ss = CAT_SLUG[cat], slugify(sub)
        subs.setdefault(cs, {}).setdefault(ss, {'slug': ss, 'nome': sub, 'total': 0})['total'] += 1
        chave = ' '.join(dict.fromkeys(norm(' '.join([
            nome, desc.replace('*', ' '), cat, sub, marca or '', attrs.get('Material', ''), attrs.get('Cor', ''), str(r['id']), r['ean'] or '',
        ])).replace('/', ' ').replace('.', ' ').replace(',', ' ').replace('-', ' ').split()))
        out.append({
            'id': str(r['id']),
            's': f'{slugify(nome)[:70].strip("-")}-{r['id']}',
            'n': nome,
            'c': cs,
            'sc': ss,
            'd': descricao(nome, sub, attrs, marca),
            'r': resumo(attrs, marca),
            'e': [[k, attrs[k]] for k in ('Material', 'Cor', 'Capacidade', 'Medidas', 'Tamanho', 'Conteúdo', 'Peças', 'Embalagem', 'Voltagem', 'Marca') if attrs.get(k)],
            'k': chave,
        })
    ordem = {s: i for i, (_, s) in enumerate(CATEGORIAS)}
    out.sort(key=lambda p: (ordem[p['c']], p['sc'], norm(p['n'])))
    with open(os.path.join(SAIDA, 'produtos.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    cats = [{'slug': s, 'nome': n, 'total': sum(x['total'] for x in subs.get(s, {}).values()),
             'subcategorias': sorted(subs.get(s, {}).values(), key=lambda x: -x['total'])} for n, s in CATEGORIAS]
    with open(os.path.join(SAIDA, 'categorias.json'), 'w', encoding='utf-8') as f:
        json.dump(cats, f, ensure_ascii=False, indent=1)
    print(f'{len(out)} produtos, {len(excl)} excluídos -> {SAIDA}')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
