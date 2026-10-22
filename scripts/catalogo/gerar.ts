// Regera o catálogo embutido no site (data/catalogo) a partir das listas exportadas do VendasPCP.
// Uso: npx tsx scripts/catalogo/gerar.ts lista-produtos-BH.csv lista-produtos-LS.csv
// No dia a dia, use a página /admin/catalogo do site, que faz o mesmo sem precisar de deploy.
import fs from "node:fs";
import path from "node:path";
import { gerarCatalogo, juntarListas, lerLista } from "../../lib/catalog-build/build";

const [bh, ls] = process.argv.slice(2);
if (!bh || !ls) {
  console.error("Uso: npx tsx scripts/catalogo/gerar.ts lista-produtos-BH.csv lista-produtos-LS.csv");
  process.exit(1);
}
const ler = (f: string) => lerLista(new TextDecoder("windows-1252").decode(fs.readFileSync(f)));
const cat = gerarCatalogo(juntarListas(ler(bh), ler(ls)));
const dir = path.join(process.cwd(), "data", "catalogo");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "produtos.json"), JSON.stringify(cat.produtos));
fs.writeFileSync(path.join(dir, "categorias.json"), JSON.stringify(cat.categorias, null, 1));
console.log(`${cat.produtos.length} produtos, ${cat.excluidos.length} excluídos, ${cat.semCategoria.length} sem categoria`);
