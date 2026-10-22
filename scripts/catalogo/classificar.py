"""Classifica os produtos das listas da Querino (BH e Lagoa Santa) em categorias do site.

Uso: python3 scripts/catalogo/gerar_site.py lista-produtos-BH.csv lista-produtos-LS.csv
(este módulo é importado pelo gerar_site.py)
"""
import re, sys, os
import pandas as pd
sys.path.insert(0, os.path.dirname(__file__))
import regras_ajuste as ajustes

def _num(s):
    return pd.to_numeric(s.str.replace('.', '', regex=False).str.replace(',', '.', regex=False), errors='coerce')

def carregar(caminho):
    # TAB, cp1252; o cabeçalho tem 22 colunas e cada linha 23 campos (TAB extra no fim)
    df = pd.read_csv(caminho, sep='\t', encoding='cp1252', dtype=str, keep_default_na=False, index_col=False)
    df = df.apply(lambda s: s.str.strip())
    df['preco'] = _num(df['Preço Venda']); df['est'] = _num(df['Estoque'])
    df['desc'] = df['Descrição do Produto']
    return df

def classificar(csv_bh, csv_ls):
    b, l = carregar(csv_bh), carregar(csv_ls)

    def prep(df,u):
        df=df.copy()
        df['ean']=df['Cód. Barras'].where(~df['Cód. Barras'].isin(['','0']),'')
        return df[['Cód.Interno','desc','Grupo','NCM','ean','preco','est','Status','Marca/Fornecedor']].add_suffix('_'+u).rename(columns={'Cód.Interno_'+u:'id'})
    m=prep(b,'bh').merge(prep(l,'ls'),on='id',how='outer')
    def pick(r,c):
        v=r[c+'_ls']; return v if isinstance(v,str) and v else (r[c+'_bh'] if isinstance(r[c+'_bh'],str) else '')
    for c in ['desc','Grupo','NCM','ean','Marca/Fornecedor']:
        m[c]=m.apply(lambda r:pick(r,c),axis=1)
    def vend(r,u):
        return (r['preco_'+u]>0) and (r['est_'+u]>0) and r['Status_'+u]!='FORA DE LINHA'
    m['BH']=m.apply(lambda r:vend(r,'bh'),axis=1); m['LS']=m.apply(lambda r:vend(r,'ls'),axis=1)
    v=m[m.BH|m.LS].copy()

    # ---------- exclusões (não-mercadoria) ----------
    motivo=pd.Series('',index=v.index)
    rules=[(r'CHASSI|PLACA: |MICROCOMPUTADOR|NOTEBOOK DELL|^A/E ', 'Patrimônio/uso interno'),
           (r'^\*{3,}|DIF\.ICMS|\bIPI\*', 'Item fiscal/sistema'),
           (r'DUPLICADO', 'Cadastro duplicado')]
    for p,t in rules: motivo[v.desc.str.contains(p,regex=True,case=False)&(motivo=='')]=t
    pmin=v[['preco_bh','preco_ls']].max(axis=1)
    motivo[(pmin<0.10)&(motivo=='')]='Preço < R$ 0,10 (suspeito)'
    excl=v[motivo!=''].assign(Motivo=motivo[motivo!=''])
    v=v[motivo==''].copy()

    # ---------- marca ----------
    BR=['PORTO BRASIL','SÃO MARCOS','SAO MARCOS','SAO DOMINGOS','DANI FERNANDES','VIA AROMA','ARCO IRIS','NOVA IMAGEM','N JALICE',
     'LYOR','ABC','FLORARTE','BRINOX','YANGZI','PARAMOUNT','PLASUTIL','TRAMONTINA','JOLITEX','BOLIVAR','MUNDIAL','BOT-ART','BOTART','KEHOME',
     'NITRON','CLINK','KAPAZI','UNY','COPOZAN','ARQPLAST','RNS','TERMOLAR','SANTANA','REPETECO','PREMISSE','JALICE','STOLF','VASAP','NOBRE',
     'BETTANIN','MABRUK','PRAFESTA','HERCULES','BSB','MIMO','MIALSKY','ARTHI','COPOPLAST','EIRILAR','INGA','MB','PLUMA','WYDA','GRILLO','UZ',
     'BURGUINA','TEXAS','OFFICER','MARTINAZZO','KEITA','SANCHES','PLAZAPEL','CROMUS','TOYPLAST','PLESTIN','FORTINOX','IRIL','INVICTA','PLASMONT',
     'NIQUELPLAST','GRILAZER','ELDORADO','SKYMSEN','ETILUX','SUPERCRON','SECALUX','SCHMIDT','VABENE','UNITERMI','HEMON','KARSTEN','UNINJET',
     'RISCHIOTO','DARNEL','BOREDA','MARFINITE','DAIWA','ZEFFIA','CLASSHOME','EVO','OXFORD','NADIR','CRISA','MARINEX','SANREMO','ORDENE','COZA',
     'PLASVALE','GB','DECOR','DANI FERNAND','D. FERNANDES','OU','KLIN','YAGZI','TAKENTE','BENILDON','1O CLASSIFIC.']
    BRN={'BOTART':'Bot-Art','BOT-ART':'Bot-Art','SAO MARCOS':'São Marcos','SÃO MARCOS':'São Marcos','SAO DOMINGOS':'São Domingos','N JALICE':'Jalice',
         'ABC':'ABC','MB':'MB','RNS':'RNS','BSB':'BSB','UZ':'UZ','GB':'GB','EVO':'EVO','UNY':'Uny','OU':'OU','DANI FERNAND':'Dani Fernandes','D. FERNANDES':'Dani Fernandes','YAGZI':'Yangzi','1O CLASSIFIC.':''}
    brx=re.compile(r'(?<![A-Z])('+'|'.join(sorted(map(re.escape,BR),key=len,reverse=True))+r')(?![A-Z])')
    def marca(s):
        s2=re.sub(r'\*[^*]*\*?',' ',s); s2=' '.join(s2.split()[-3:]); f=brx.findall(s2)
        if not f: return ''
        x=f[-1]; return BRN.get(x,x.title() if len(x)>3 else x)

    # ---------- nome amigável ----------
    AB={'CX':'caixa','ORG':'organizador','PLAST':'plástico','BCO':'branco','BCA':'branca','BC':'branco','PT':'preto','PTO':'preto','VM':'vermelho',
     'AZ':'azul','VD':'verde','AM':'amarelo','CZ':'cinza','RS':'rosa','TRANSP':'transparente','DESC':'descartável','INOX':'inox','ALUM':'alumínio',
     'CERAM':'cerâmica','PORC':'porcelana','DECOR':'decorativo','RET':'retangular','RED':'redondo','QUAD':'quadrado','BAND':'bandeja','EMB':'embalagem',
     'IND':'industrial','GASTR':'gastronômico','ESPEC':'especial','POLIET':'polietileno','CROM':'cromado','MAD':'madeira','ACRIL':'acrílico',
     'TP':'tampa','REF':'refil','UN':'unidade','UNID':'unidades','PCT':'pacote','DIAM':'diâmetro','ALT':'altura','LARG':'largura','COMP':'comprimento',
     'P':'para','C':'com','S':'sem','ELET':'elétrico','AUT':'automático','INF':'infantil','PEQ':'pequeno','MED':'médio','GDE':'grande','GD':'grande','LIQ':'líquido','TROP':'tropical','S.MESA':'sobremesa','ESTAMP':'estampado','ELAST':'elástico','ANTIAD':'antiaderente','ANTIADER':'antiaderente','INOXID':'inoxidável',
     'ESTAMP':'estampado','TRAD':'tradicional','TERM':'térmico','SILIC':'silicone','VIDR':'vidro','DOUR':'dourado','PRAT':'prateado'}
    AC={'XICARA':'xícara','XICARAS':'xícaras','TACA':'taça','TACAS':'taças','CACAROLA':'caçarola','CERAMICA':'cerâmica','PLASTICO':'plástico',
     'PLASTICA':'plástica','ALUMINIO':'alumínio','ACRILICO':'acrílico','ACRILICA':'acrílica','TERMICA':'térmica','TERMICO':'térmico','AGUA':'água',
     'CAFE':'café','CHA':'chá','ACUCAREIRO':'açucareiro','ACO':'aço','TABUA':'tábua','ESPATULA':'espátula','SANITARIA':'sanitária','PRESSAO':'pressão',
     'PAO':'pão','MAO':'mão','PAPELAO':'papelão','PECAS':'peças','PECA':'peça','POLIESTER':'poliéster','DIAMETRO':'diâmetro','UTENSILIOS':'utensílios',
     'UTENSILIO':'utensílio','MULTIUSO':'multiuso','ACUCAR':'açúcar','LIMAO':'limão','ORGANIZACAO':'organização','DECORACAO':'decoração',
     'ESCORREDOR':'escorredor','LIQUIDO':'líquido','HIGIENICO':'higiênico','SABAO':'sabão','PA':'pá','RAMEQUIM':'ramequim','PIRES':'pires',
     'PORCAO':'porção','BALAO':'balão','CORACAO':'coração','ESTRELA':'estrela','METALICO':'metálico','METALICA':'metálica','ELETRICO':'elétrico',
     'ELETRICA':'elétrica','LAMPADA':'lâmpada','ARVORE':'árvore','GUARDANAPO':'guardanapo','PE':'pé','RETANGULAR':'retangular','VIDRO':'vidro',
     'BAU':'baú','CABECA':'cabeça','DESCARTAVEL':'descartável','DESCARTAVEIS':'descartáveis','GARCOM':'garçom','PINCA':'pinça','ESPAGUETE':'espaguete',
     'MANTEIGUEIRA':'manteigueira','FRUTEIRA':'fruteira','LIXEIRA':'lixeira','MOVEL':'móvel','UTIL':'útil','PORTATIL':'portátil','HERMETICO':'hermético',
     'HERMETICA':'hermética','ALCA':'alça','ALCAS':'alças','SINALIZACAO':'sinalização','CALDEIRAO':'caldeirão','MAQUINA':'máquina','ESSENCIA':'essência',
     'ORGANICO':'orgânico','ORGANICA':'orgânica','IMPERMEAVEL':'impermeável','LACO':'laço','LACOS':'laços','CLASSICA':'clássica','CLASSICO':'clássico','TENIS':'tênis',
     'FAMILIA':'família','VALVULA':'válvula','ALGODAO':'algodão','CORDAO':'cordão','CHAO':'chão','ORQUIDEA':'orquídea','SAO':'são','LTS':'L','LT':'L','TPA':'tampa',
     'PCS':'peças','PC':'peça','CBO':'cabo','SACHE':'sachê','PRATICO':'prático','PRATICA':'prática','RUSTICO':'rústico','RUSTICA':'rústica','UNICO':'único',
     'JAPONES':'japonês','FACIL':'fácil','FEIJAO':'feijão','BOTAO':'botão','FRANCES':'francês','FRANCESA':'francesa','AMBAR':'âmbar','OCULOS':'óculos',
     'CUBICO':'cúbico','BASICO':'básico','BASICA':'básica','ECOLOGICO':'ecológico','HIGIENICA':'higiênica','GIRATORIO':'giratório','GIRATORIA':'giratória',
     'ACESSORIO':'acessório','ACESSORIOS':'acessórios','LIQUIDA':'líquida','ANTIADERENTE':'antiaderente','ESPATULAS':'espátulas','ACOUGUE':'açougue',
     'PESSEGO':'pêssego','CERAMICO':'cerâmico','PORTUGUES':'português','METALIZADO':'metalizado','VOLUMETRICO':'volumétrico','ESTANTE':'estante',
     'DIGITOS':'dígitos','PRECOS':'preços','PRECO':'preço','DECORATIVA':'decorativa','INFLAVEL':'inflável','MACARRAO':'macarrão','DOMINO':'dominó',
     'EXTENSAO':'extensão','PROTECAO':'proteção','CONSERVACAO':'conservação','CONFEITARIA':'confeitaria','TERMOMETRO':'termômetro','REFRATARIO':'refratário',
     'SAUDE':'saúde','LUMINARIA':'luminária','ROSTO':'rosto','PRESENCA':'presença','LAMINA':'lâmina','LAMINAS':'lâminas','ELETRICOS':'elétricos','ESPECIFICO':'específico',
     'TRIPE':'tripé','CAPSULA':'cápsula','CAPSULAS':'cápsulas','OLEO':'óleo','ALCOOL':'álcool','AUTOMATICO':'automático'}
    SMALL={'de','da','do','das','dos','com','para','e','em','sem','a','o','ou'}
    def nome(s):
        orig=s
        s=re.sub(r'\*[^*]*\*?',' ',s)                 # códigos *...*
        s=re.sub(r'^NATAL\s*-\s*','',s)
        s=re.sub(r'\b(C/\d+[X\d]*|CX C/\d+.*)$','',s).strip() if False else s
        mk=marca(s)
        if mk:  # remove marca do fim
            s=re.sub(r'\s+'+re.escape(mk.upper())+r'\s*$','',s.upper())
        s=re.sub(r'\s+1O CLASSIFIC\.?\s*$','',s)
        s=re.sub(r'([A-Z]{2,4})/([A-Z]{2,4})',lambda m:(AB.get(m.group(1),m.group(1))+'/'+AB.get(m.group(2),m.group(2))).upper() if m.group(1) in AB and m.group(2) in AB else m.group(0),s)
        s=re.sub(r'\s*-\s*[A-Z]\d{3,}\s*$','',s)       # - B0621
        s=re.sub(r'\b\d{5,}[A-Z]?\b(?=\s*$)','',s)      # código numérico solto no fim
        s=re.sub(r'\bS\.\s?MESA\b','SOBREMESA',s)
        s=s.replace('C/',' C/ ').replace('P/',' P/ ').replace('S/',' S/ ')
        toks=re.split(r'(\s+)',s.strip()); out=[]
        for t in toks:
            if t.isspace() or not t: out.append(' ' if t else ''); continue
            k=t.rstrip('.,').replace('/','')
            if k in ('C','P','S') and t.endswith('/'): out.append(AB[k]); continue
            if re.fullmatch(r'\d+([.,]\d+)?(CM|MM|ML|LTS?|L|KG|G|M|W|V|X\d+.*)?',t):
                t=re.sub(r'(\d)LTS?$',r'\1 L',t); t=re.sub(r'(\d)(CM|MM|ML|KG|G|W|V)$',lambda m:m.group(1)+m.group(2).lower(),t)
                t=t.replace('.',',') if re.fullmatch(r'\d+\.\d+.*',t) else t
                out.append(t.lower().replace(' l',' L').replace('x','x')); continue
            if k in AC: out.append(AC[k]); continue
            if k in AB and (t.endswith('.') or len(k)<=3): out.append(AB[k]); continue
            if k.startswith('S.MESA'): out.append('sobremesa'); continue
            if '/' in t and all(p in AB for p in t.split('/') if p): out.append('/'.join(AB[p] for p in t.split('/') if p)); continue
            out.append(t.lower())
        s=re.sub(r'\s+',' ',''.join(out)).strip(' -,')
        w=s.split(' ')
        w=[x for i,x in enumerate(w) if i==0 or x.lower()!=w[i-1].lower()]
        w=[x if (i>0 and x in SMALL) else (x[:1].upper()+x[1:]) for i,x in enumerate(w)]
        s=' '.join(w)
        s=re.sub(r'\b(\d+)x(\d+)',r'\1x\2',s)
        s=re.sub(r'/([a-zà-ú])',lambda m:'/'+m.group(1).upper(),s)
        if mk and mk.lower() not in s.lower(): s=f'{s} {mk}'
        s=s.strip()
        if len(s)<4:
            s=' '.join(w.capitalize() for w in re.sub(r'[*]',' ',orig).split()[:8])
        return s

    # ---------- categoria ----------
    def has(d,*ws): return any(re.search(r'(?<![A-Z])'+w,d) for w in ws)
    def cat(r):
        d=r.desc.upper(); g=r.Grupo.upper(); f=d.split()[0].strip('*.') if d.split() else ''
        if f=='NATAL' or 'NATAL' in d[:12] or has(d,'PAPAI NOEL','ARVORE DE NATAL','PISCA PISCA','BOLA NATAL'): return 'Natal','Decoração de Natal'
        if f in ('VASO','CACHEPO','POTICHE','BUQUE','BOMBONIERE','LUMINARIA','CENTRO'): return 'Decoração','Vasos e plantas' if f in ('VASO','CACHEPO','POTICHE','BUQUE') else 'Objetos decorativos'
        if f in ('ESSENCIA','HOME') or has(d,'HOME SPRAY'): return 'Decoração','Aromas e velas'
        if f in ('TORNEIRA','DUCHA','RALO','CHUVEIRO','SIFAO','REGISTRO'): return 'Casa e Ferramentas','Hidráulica'
        if f in ('ESPETO','GRELHA','CHURRASQUEIRA','ACENDEDOR','BIFETEIRA'): return 'Utensílios de Cozinha','Churrasco'
        if f in ('BICO',) and has(d,'BOLO','CONFEIT','WILTON','DECOR'): return 'Utensílios de Cozinha','Confeitaria'
        if f in ('CHAIRA','SOCADOR','MODELADOR'): return 'Utensílios de Cozinha','Utensílios de cozinha'
        if f in ('FAQUEIRO',): return 'Mesa Posta','Talheres'
        if f in ('GAMELA','RAMEKIN'): return 'Mesa Posta','Pratos e louças'
        if f in ('MARMITA',): return 'Organização','Potes e mantimentos'
        if f in ('PANO','FLANELA','ESPONJA','RODO','VASSOURA'): return 'Limpeza e Higiene','Limpeza e higiene'
        if f in ('PASSADEIRA','CAPACHO','TAPETE'): return 'Decoração','Têxteis e tapetes'
        if f in ('PORTA','PORTA-') and has(d,'GUARDANAPO','COPO','TALHER','FRIOS','MANTEIGA','BOLO','QUEIJO','PALITO','TEMPERO'): return 'Mesa Posta','Acessórios de mesa'
        if has(d,'DESC\\.','DESCART','ISOPOR','MARMITEX','BOBINA','SACO LIXO','SACO P/ LIXO','PAPEL ALUM','FILME PVC','PALITO','CANUDO','C/100','C/500','C/1000','C/50 ','C/50$','C/25','SACOLA','SACO ','EMB\\.','EMBALAGEM','FITA ADES','FITA CETIM','GUARDANAPO PAPEL','PAPEL TOALHA','PAPEL HIG','FORMINHA'):
            sub='Sacos e sacolas' if has(d,'SACO','SACOLA','BOBINA') else 'Copos, pratos e talheres descartáveis' if has(d,'COPO','PRATO','TALHER','GARFO','COLHER','FACA','TACA') else 'Marmitas e potes' if has(d,'MARMITA','POTE','BAND','EMB','MARMITEX','TAMPA') else 'Papel, filmes e outros'
            return 'Embalagens e Descartáveis',sub
        if has(d,'IND\\.','INDUSTRIAL','GASTR','HOTEL','CALDEIRAO','PALLET','CONTENTOR','CONTEINER','CAIXA PLAST.*VAZAD','CX PLAST.*VAZAD','CX TERMICA','EPI','BOTA ','AVENTAL','TOUCA','MASCARA'):
            return 'Linha Industrial','Cozinha profissional'
        if has(d,'BALDE GELO','BALDE P/ ?GELO','BALDE ACRIL','CHAMPAGNE','CHAMPANHE'): return 'Mesa Posta','Acessórios de mesa'
        if has(d,'LIXEIRA','BALDE','VASSOURA','RODO','PANO ','ESPONJA','DETERG','ALCOOL','SABONETE','DESINFET','ESCOVA SANIT','ESCOVA LAVA','\\bPA ','MOP','LUVA','LIMPA','ALVEJ','AMACIANTE','SABAO','SANITARIA','DESENTUP','PREGADOR','VARAL','BACIA','TANQUE','CESTO ROUPA'):
            sub='Lixeiras' if 'LIXEIRA' in d else 'Lavanderia' if has(d,'PREGADOR','VARAL','CESTO ROUPA','BACIA','TANQUE','AMACIANTE') else 'Limpeza e higiene'
            return 'Limpeza e Higiene',sub
        if has(d,'AROMATIZ','DIFUSOR','VELA','VASO','CACHEPO','ABAJUR','QUADRO','PORTA RETRATO','PORTA-RETRATO','ESCULTURA','ESTATUA','ENFEITE','FLOR ','ARRANJO','POTICHE','ALMOFADA','MANTA','TAPETE','ESPELHO','CASTICAL','LANTERNA DECOR','ORQUIDEA','FOLHAGEM','PLANTA ART','RELOGIO PAREDE','ADORNO','OBJETO DECOR','CENTRO DE MESA'):
            sub='Vasos e plantas' if has(d,'VASO','CACHEPO','FLOR','ARRANJO','POTICHE','ORQUIDEA','FOLHAGEM','PLANTA') else 'Aromas e velas' if has(d,'AROMATIZ','DIFUSOR','VELA') else 'Têxteis e tapetes' if has(d,'ALMOFADA','MANTA','TAPETE') else 'Objetos decorativos'
            return 'Decoração',sub
        if has(d,'POTE','ORG\\.','ORGANIZ','CESTO','CAIXA ORG','CX ORG','CABIDE','SAPATEIRA','GAVETEIRO','PORTA ','ESTANTE','PRATELEIRA','CAIXA PLAST','CX PLAST','BAU','NICHO','MANTIMENTO','DISPENSER','DISPENSADOR','SUPORTE','GANCHO','CABIDEIRO','PORTA-'):
            sub='Potes e mantimentos' if has(d,'POTE','MANTIMENTO') else 'Cestos' if 'CESTO' in d else 'Caixas e organizadores'
            return 'Organização',sub
        if has(d,'PANELA','CACAROLA','FRIGIDEIRA','CHALEIRA','LEITEIRA','FERVEDOR','WOK','GRILL','CAÇAROLA','ESPAGUETEIRA','CUSCUZEIRA','PIPOQUEIRA','TACHO'):
            return 'Panelas','Panelas e frigideiras'
        if has(d,'ASSADEIRA','FORMA ','FORMA$','REFRATARIO','TABULEIRO','PIZZA'):
            return 'Panelas','Assadeiras e formas'
        if has(d,'PRATO','TACA','COPO','XICARA','CANECA','TRAVESSA','SOUSPLAT','APARELHO','JOGO JANTAR','JG JANTAR','TALHER','GARFO','COLHER','FACA MESA','FACA CHURR','SALADEIRA','PETISQUEIRA','JARRA','BOWL','CUMBUCA','TIGELA','RAMEQUIM','BULE','ACUCAREIRO','MANTEIGUEIRA','JOGO AMERICANO','LUGAR AMERICANO','GUARDANAPO','PORTA GUARDANAPO','GARRAFA TERMICA','GARRAFA TERM','BOLEIRA','FRUTEIRA','MOLHEIRA','SOPEIRA','PETISQ','QUEIJEIRA','PIRES','CALICE','CONJ.*CAFE','CONJ.*CHA','FARINHEIRA','PORTA FRIOS','CAMINHO DE MESA','TOALHA MESA','TOALHA DE MESA','GARRAFA','DECANTER','HASHI','PORTA COPO','BALDE GELO','BALDE P/ GELO','BALDE P/GELO','BALDE ACRIL','COQUETELEIRA','DOSADOR','PETISQ','TORRE','SUPLA'):
            sub='Pratos e louças' if has(d,'PRATO','APARELHO','JANTAR','TRAVESSA','SOUSPLAT','TIGELA','BOWL','CUMBUCA','RAMEQUIM','SALADEIRA','SOPEIRA','MOLHEIRA') else 'Copos, taças e xícaras' if has(d,'TACA','COPO','XICARA','CANECA','CALICE','PIRES') else 'Talheres' if has(d,'TALHER','GARFO','COLHER','FACA') else 'Café e chá' if has(d,'BULE','GARRAFA','ACUCAREIRO','CAFE','CHA ') else 'Acessórios de mesa'
            return 'Mesa Posta',sub
        if has(d,'TABUA','ESCORREDOR','ESPATULA','CONCHA','PEGADOR','PENEIRA','RALADOR','ABRIDOR','AFIADOR','BATEDOR','ROLO','FUNIL','MEDIDOR','ESCUMADEIRA','FACA','TESOURA','SACA ROLHA','SACA-ROLHA','ESPREMEDOR','AMASSADOR','DESCASCADOR','MOEDOR','PILAO','PINCEL','BICO CONFEIT','SACO CONFEIT','CORTADOR','FATIADOR','TERMOMETRO','LUVA TERM','PANO DE PRATO','DESCANSO','ESCUMAD','COADOR','FILTRO','TAMPA','ESCORREDOR','BAND','PORTA TEMPERO','GALHETEIRO','SALEIRO','PALITEIRO','LIQUIDIF','BATEDEIRA','SANDUICHEIRA','CAFETEIRA','AIR FRYER','PROCESSADOR','BALANCA'):
            sub='Eletroportáteis' if has(d,'LIQUIDIF','BATEDEIRA','SANDUICHEIRA','CAFETEIRA','AIR FRYER','PROCESSADOR','ELET') else 'Facas e tábuas' if has(d,'FACA','TABUA','AFIADOR') else 'Confeitaria' if has(d,'BICO','CONFEIT','PINCEL','BATEDOR','ROLO') else 'Utensílios de cozinha'
            return 'Utensílios de Cozinha',sub
        if has(d,'ALICATE','CHAVE','TOMADA','LAMPADA','FITA ISOL','PLACA SINAL','PLACA ','ESCADA','CADEADO','MANGUEIRA','EXTENSAO','PARAFUSO','MARTELO','TRENA','SERROTE','BROCA','PILHA','INTERRUPTOR','ABRACADEIRA','COLA','SILICONE','REGADOR','FECHADURA','LANTERNA'):
            return 'Casa e Ferramentas','Ferramentas e sinalização'
        if has(d,'TOALHA','LENCOL','EDREDOM','COBERTOR','TRAVESSEIRO','CORTINA','JOGO DE BANHO','ROUPAO','BANHEIRO','SABONETEIRA','PORTA ESCOVA','BOX'):
            return 'Cama, Mesa e Banho','Banho e enxoval'
        if 'DESCART' in g: return 'Embalagens e Descartáveis','Papel, filmes e outros'
        if has(g,'LIMPEZA','HIGIENE'): return 'Limpeza e Higiene','Limpeza e higiene'
        if 'EPI' in g or 'TERMICOS' in g: return 'Linha Industrial','Cozinha profissional'
        if has(g,'DECORA','AROMATIZ'): return 'Decoração','Objetos decorativos'
        if 'FERRAMENT' in g: return 'Casa e Ferramentas','Ferramentas e sinalização'
        return 'Outros','A revisar'
    v[['Categoria','Subcategoria']]=v.apply(lambda r:pd.Series(cat(r)),axis=1)
    x=v.desc.map(ajustes.excluir)
    excl=pd.concat([excl,v[x].assign(Motivo='Fora do escopo do site (decisão da empresa)')]); v=v[~x].copy()
    cs=[ajustes.ajuste(dd,c,s) for dd,c,s in zip(v.desc,v.Categoria,v.Subcategoria)]
    v['Categoria']=[a for a,_ in cs]; v['Subcategoria']=[b for _,b in cs]
    v['Marca']=v.desc.map(marca)
    v['Nome sugerido']=v.desc.map(nome)
    v['Disponível em']=v.apply(lambda r:'BH e Lagoa Santa' if r.BH and r.LS else ('Só BH' if r.BH else 'Só Lagoa Santa'),axis=1)

    return v.sort_values(['Categoria', 'Subcategoria', 'Nome sugerido']), excl
