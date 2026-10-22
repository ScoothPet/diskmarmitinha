# Disk Marmitinha Casa & Estilo — site

Site institucional com catálogo e fluxo de orçamento (sem venda online), feito em **Next.js 15 (App Router) + Tailwind CSS 4 + TypeScript**.

## Páginas
- `/` — home
- `/catalogo` e `/catalogo/[categoria]` — catálogo com busca e filtro por categoria
- `/orcamento` — minha lista: quantidades, item livre, entrega (CEP com preenchimento automático via ViaCEP) ou retirada em loja, dados do cliente e envio por WhatsApp ou e-mail
- `/empresas`, `/quem-somos`, `/unidades`, `/contato`

## Dados
- `lib/site.ts` — telefone, e-mail, horários, unidades, links
- `data/catalogo/produtos.json` e `categorias.json` — catálogo real (6.942 produtos das duas lojas), gerado a partir das listas da Querino
- `lib/catalog.ts` — categorias (textos, imagens, ícones) e tipos; seguro para o navegador
- `lib/catalog-server.ts` — leitura dos produtos e busca (só no servidor); `/api/catalogo` atende a busca do catálogo
- `/produto/[slug]` — página de cada produto (gerada na primeira visita e guardada em cache)

## Atualizar o catálogo
Com as listas novas da Querino (`lista-produtos-BH.csv` e `lista-produtos-LS.csv`, que **não** vão para o repositório):
```bash
pip install pandas
python3 scripts/catalogo/gerar_site.py caminho/lista-produtos-BH.csv caminho/lista-produtos-LS.csv
```
Entram produtos com preço > 0, estoque > 0 e não "FORA DE LINHA" em pelo menos uma unidade. As regras de categoria ficam em `scripts/catalogo/classificar.py` e `scripts/catalogo/regras_ajuste.py`; nomes e descrições para o cliente são gerados em `scripts/catalogo/gerar_site.py`. Nada disso altera o sistema da Querino.

## Variáveis de ambiente
- `NEXT_PUBLIC_SITE_URL` — URL pública (padrão `https://diskmarmitinha.com.br`)
- `NEXT_PUBLIC_INDEXABLE=true` — libera indexação por buscadores (deixe desligado nos links de teste)

## Rodar localmente
```bash
npm install
npm run dev
```
