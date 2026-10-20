# Disk Marmitinha Casa & Estilo — site

Site institucional com catálogo e fluxo de orçamento (sem venda online), feito em **Next.js 15 (App Router) + Tailwind CSS 4 + TypeScript**.

## Páginas
- `/` — home
- `/catalogo` e `/catalogo/[categoria]` — catálogo com busca e filtro por categoria
- `/orcamento` — minha lista: quantidades, item livre, entrega (CEP com preenchimento automático via ViaCEP) ou retirada em loja, dados do cliente e envio por WhatsApp ou e-mail
- `/empresas`, `/quem-somos`, `/unidades`, `/contato`

## Dados
- `lib/site.ts` — telefone, e-mail, horários, unidades, links
- `lib/catalog.ts` — categorias e produtos (**itens ilustrativos**; substituir pelo catálogo real)

## Variáveis de ambiente
- `NEXT_PUBLIC_SITE_URL` — URL pública (padrão `https://diskmarmitinha.com.br`)
- `NEXT_PUBLIC_INDEXABLE=true` — libera indexação por buscadores (deixe desligado nos links de teste)

## Rodar localmente
```bash
npm install
npm run dev
```
