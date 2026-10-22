# Disk Marmitinha Casa & Estilo — site

Site institucional com catálogo e fluxo de orçamento (sem venda online), feito em **Next.js 15 (App Router) + Tailwind CSS 4 + TypeScript**.

## Páginas
- `/` — home
- `/catalogo` e `/catalogo/[categoria]` — catálogo com busca e filtro por categoria
- `/orcamento` — minha lista: quantidades, item livre, entrega (CEP com preenchimento automático via ViaCEP) ou retirada em loja, dados do cliente e envio por WhatsApp ou e-mail
- `/empresas`, `/quem-somos`, `/unidades`, `/contato`

## Dados
- `lib/site.ts` — telefone, e-mail, horários, unidades, links
- `data/catalogo/produtos.json` e `categorias.json` — catálogo inicial embutido no site
- `lib/catalog.ts` — categorias (textos, imagens, ícones) e tipos; seguro para o navegador
- `lib/catalog-server.ts` — leitura do catálogo vigente (Vercel Blob ou o embutido) e busca, só no servidor; `/api/catalogo` atende a busca
- `/produto/[slug]` — página de cada produto (gerada na primeira visita e guardada em cache)

## Atualizar o catálogo
Toda semana, exporte do VendasPCP o cadastro de produtos de **Belo Horizonte** e de **Lagoa Santa** e envie os dois arquivos em **/admin/catalogo** (senha na variável `ADMIN_CATALOGO_SENHA` da Vercel). O navegador lê as listas, manda ao site só se cada produto está à venda em cada loja (preço e estoque não saem do computador), e o site gera nomes, descrições e categorias e publica no Vercel Blob. Não precisa de deploy.

- Entram produtos com preço > 0, estoque > 0 e não "FORA DE LINHA" em pelo menos uma loja.
- Regras de categoria, abreviações e textos: `lib/catalog-build/build.ts` e `lib/catalog-build/regras.ts`.
- Produtos que não se encaixam em nenhuma categoria aparecem no resumo do envio para revisão.
- O catálogo embutido em `data/catalogo` só é usado enquanto nenhum foi publicado pela página. Para regerá-lo: `npx tsx scripts/catalogo/gerar.ts lista-BH.csv lista-LS.csv`.

Nada disso altera o sistema da Querino.
