import { site, units } from "./site";

export type FaqLink = { label: string; href: string };
export type FaqItem = { id: string; q: string; a: string[]; links?: FaqLink[] };
export type FaqGroup = { id: string; title: string; description: string; items: FaqItem[] };

const bh = units.find((u) => u.id === "bh")!;
const ls = units.find((u) => u.id === "ls")!;

export const faqGroups: FaqGroup[] = [
  {
    id: "orcamento",
    title: "Orçamento e pedidos",
    description: "Como montar sua lista e receber os valores.",
    items: [
      {
        id: "como-pedir",
        q: "Como faço um orçamento pelo site?",
        a: [
          "Navegue pelo catálogo e adicione os produtos à sua lista. Na página Minha lista, ajuste as quantidades, escolha entre entrega ou retirada na loja, informe seu nome e WhatsApp e clique em Enviar pelo WhatsApp.",
          "A lista chega pronta para a nossa equipe, que confere a disponibilidade e responde com valores e prazo.",
        ],
        links: [
          { label: "Ver catálogo", href: "/catalogo" },
          { label: "Minha lista", href: "/orcamento" },
        ],
      },
      {
        id: "comprar-online",
        q: "Posso comprar e pagar direto pelo site?",
        a: [
          "Ainda não. O site é usado para montar a lista e pedir o orçamento. O pagamento e os detalhes da compra são combinados com a nossa equipe depois que você recebe os valores.",
        ],
      },
      {
        id: "cadastro",
        q: "Preciso fazer cadastro para pedir orçamento?",
        a: ["Não. No pedido de orçamento você informa apenas nome, WhatsApp, e-mail e CPF ou CNPJ."],
      },
      {
        id: "item-fora",
        q: "Não encontrei o produto que procuro. E agora?",
        a: [
          "Temos mais de 20 mil itens nas lojas, e nem todos estão no site. Na página Minha lista, use o campo Não encontrou no catálogo? para escrever o produto e a quantidade. Nossa equipe confirma a disponibilidade junto com o orçamento.",
        ],
        links: [{ label: "Adicionar item à lista", href: "/orcamento#item-livre" }],
      },
      {
        id: "precos",
        q: "Os preços aparecem no site?",
        a: [
          "Não. Preços e disponibilidade variam conforme o estoque e a quantidade, por isso são informados no orçamento. Assim você recebe o valor atualizado para o seu pedido.",
        ],
      },
      {
        id: "resposta",
        q: "Em quanto tempo recebo a resposta?",
        a: [`Respondemos em horário comercial: ${site.hoursShort}. Pedidos enviados fora desse horário são respondidos no próximo período de atendimento.`],
      },
      {
        id: "sem-whatsapp",
        q: "Posso enviar a lista por e\u2011mail?",
        a: [`Sim. Na página Minha lista, use o botão Enviar por e-mail. A lista vai para ${site.email}.`],
      },
    ],
  },
  {
    id: "entrega",
    title: "Entrega e retirada",
    description: "Receba onde estiver ou retire em uma das lojas.",
    items: [
      {
        id: "entregam",
        q: "Vocês fazem entrega?",
        a: ["Sim, entregamos para todo o Brasil, e pedidos a partir de R$ 150 em BH e região podem ter frete grátis, mediante condições (consulte as condições com a nossa equipe). No pedido de orçamento, escolha Receber no endereço e informe o CEP e o endereço completo."],
      },
      {
        id: "frete",
        q: "Quanto custa o frete e qual o prazo?",
        a: [
          "Em BH e região, pedidos a partir de R$ 150 podem ter frete grátis, mediante condições. O frete grátis não é automático: consulte as condições com a nossa equipe, que confirma junto com o orçamento se o seu pedido se enquadra.",
          "Para outras cidades e para pedidos abaixo desse valor, o frete e o prazo dependem do endereço e do volume e são informados junto com o orçamento, antes de você confirmar a compra.",
        ],
      },
      {
        id: "retirada",
        q: "Posso retirar o pedido na loja?",
        a: [
          `Sim. Escolha Retirar na loja e selecione a unidade ${bh.name} ou ${ls.name}. Avisamos pelo WhatsApp quando o pedido estiver separado.`,
        ],
      },
      {
        id: "estacionamento",
        q: "As lojas têm estacionamento?",
        a: ["Sim, as duas unidades têm estacionamento para clientes."],
      },
    ],
  },
  {
    id: "pagamento",
    title: "Pagamento",
    description: "Condições combinadas no orçamento.",
    items: [
      {
        id: "parcelamento",
        q: "Posso parcelar minhas compras?",
        a: [
          "Sim. Parcelamos em até 10x sem juros, exceto em produtos de limpeza, higienização e descartáveis. Consulte as condições com a nossa equipe no momento do orçamento.",
        ],
      },
      {
        id: "formas",
        q: "Quais formas de pagamento vocês aceitam?",
        a: ["As formas de pagamento disponíveis são informadas pela nossa equipe junto com o orçamento, de acordo com o tipo de pedido e a forma de recebimento."],
      },
    ],
  },
  {
    id: "empresas",
    title: "Empresas e condomínios",
    description: "Compras para o seu negócio.",
    items: [
      {
        id: "atendem-empresas",
        q: "Vocês atendem empresas, restaurantes e condomínios?",
        a: [
          "Sim. Atendemos marmitarias, restaurantes, lanchonetes, escolas, escritórios, eventos e condomínios com embalagens, descartáveis, limpeza, higiene e lixeiras.",
        ],
        links: [{ label: "Atendimento para empresas", href: "/empresas" }],
      },
      {
        id: "recorrente",
        q: "Posso enviar uma lista de compras recorrente?",
        a: [
          "Pode. Monte a lista com todos os itens de reposição e envie de uma vez. Se preferir, fale com a nossa equipe pela página de empresas para combinar volumes e frequência.",
        ],
      },
      {
        id: "cnpj",
        q: "Preciso informar CNPJ?",
        a: ["No pedido de orçamento há o campo CPF/CNPJ. Para compras de empresa ou condomínio, informe o CNPJ e marque Minha empresa ou Condomínio."],
      },
      {
        id: "clube",
        q: "Existe algum programa com preços especiais?",
        a: ["Sim, temos o Clube do Cliente, com condições especiais. Fale com a nossa equipe para saber como participar."],
      },
    ],
  },
  {
    id: "lojas",
    title: "Lojas e atendimento",
    description: "Endereços, horários e contato.",
    items: [
      {
        id: "enderecos",
        q: "Onde ficam as lojas?",
        a: [
          `${bh.name}: ${bh.street}, ${bh.cityLine}${bh.cep ? `, CEP ${bh.cep}` : ""}.`,
          `${ls.name}: ${ls.street}, ${ls.cityLine}.`,
        ],
        links: [{ label: "Ver unidades e mapas", href: "/unidades" }],
      },
      {
        id: "horario",
        q: "Qual o horário de funcionamento?",
        a: [site.hours.map((h) => `${h.label}: ${h.value}`).join(". ") + ". O horário é o mesmo nas duas lojas."],
      },
      {
        id: "contato",
        q: "Como falo com a Disk Marmitinha?",
        a: [
          `Pelo telefone ${site.phone.display}, que atende as duas lojas, pelo WhatsApp de atendimento, pelo e-mail ${site.email} ou pelo formulário da página de contato.`,
          `A unidade Lagoa Santa também atende pelo WhatsApp ${site.whatsappLagoaSanta.display}.`,
        ],
        links: [
          { label: "Página de contato", href: "/contato" },
          { label: "WhatsApp Lagoa Santa", href: `https://wa.me/${site.whatsappLagoaSanta.number}` },
        ],
      },
    ],
  },
];
