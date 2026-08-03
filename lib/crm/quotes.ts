import type { CrmDomainState, QuoteItem, QuoteRecord, QuoteStatus } from "./domain";

export type QuoteItemInput = Pick<QuoteItem,"id"|"productId"|"sku"|"name"|"description"|"quantity"|"unit"|"unitPriceMinor"|"lineDiscountMinor"|"taxRateBasisPoints">;
export type QuoteCalculation = { items:QuoteItem[]; subtotalMinor:number; discountMinor:number; taxableMinor:number; taxMinor:number; totalMinor:number };

const transitions:Record<QuoteStatus,readonly QuoteStatus[]>={draft:["sent"],sent:["accepted","declined","expired"],accepted:[],declined:[],expired:[]};

export function calculateQuote(items:QuoteItemInput[],quoteDiscountMinor=0):QuoteCalculation {
  assertMinor("Desconto da proposta",quoteDiscountMinor);
  if(items.length===0)throw new Error("A proposta precisa de pelo menos um item");
  const base=items.map(item=>{
    if(!item.id.trim())throw new Error("Item sem id estável");
    if(!Number.isFinite(item.quantity)||item.quantity<=0)throw new Error("Quantidade inválida");
    assertMinor("Preço unitário",item.unitPriceMinor);assertMinor("Desconto do item",item.lineDiscountMinor);
    if(!Number.isInteger(item.taxRateBasisPoints)||item.taxRateBasisPoints<0||item.taxRateBasisPoints>10000)throw new Error("Imposto deve estar entre 0 e 10000 pontos-base");
    const subtotalMinor=Math.round(item.quantity*item.unitPriceMinor);
    if(item.lineDiscountMinor>subtotalMinor)throw new Error("Desconto do item excede o subtotal");
    return {...item,subtotalMinor,afterLineDiscount:subtotalMinor-item.lineDiscountMinor};
  });
  const afterLineDiscount=base.reduce((sum,item)=>sum+item.afterLineDiscount,0);
  if(quoteDiscountMinor>afterLineDiscount)throw new Error("Desconto da proposta excede o valor dos itens");
  let allocated=0;
  const calculated=base.map((item,index):QuoteItem=>{
    const allocatedDiscountMinor=index===base.length-1?quoteDiscountMinor-allocated:Math.floor(quoteDiscountMinor*item.afterLineDiscount/Math.max(1,afterLineDiscount));
    allocated+=allocatedDiscountMinor;
    const discountMinor=item.lineDiscountMinor+allocatedDiscountMinor;
    const taxableMinor=item.subtotalMinor-discountMinor;
    const taxMinor=Math.round(taxableMinor*item.taxRateBasisPoints/10000);
    return {id:item.id,productId:item.productId,sku:item.sku,name:item.name,description:item.description,quantity:item.quantity,unit:item.unit,unitPriceMinor:item.unitPriceMinor,lineDiscountMinor:item.lineDiscountMinor,allocatedDiscountMinor,discountMinor,taxRateBasisPoints:item.taxRateBasisPoints,subtotalMinor:item.subtotalMinor,taxableMinor,taxMinor,totalMinor:taxableMinor+taxMinor};
  });
  return calculated.reduce<QuoteCalculation>((totals,item)=>({items:calculated,subtotalMinor:totals.subtotalMinor+item.subtotalMinor,discountMinor:totals.discountMinor+item.discountMinor,taxableMinor:totals.taxableMinor+item.taxableMinor,taxMinor:totals.taxMinor+item.taxMinor,totalMinor:totals.totalMinor+item.totalMinor}),{items:calculated,subtotalMinor:0,discountMinor:0,taxableMinor:0,taxMinor:0,totalMinor:0});
}

export function nextQuoteNumber(state:Pick<CrmDomainState,"quotes">,year:number):number {
  if(!Number.isInteger(year)||year<2000||year>9999)throw new Error("Ano da proposta inválido");
  return state.quotes.filter(quote=>quote.year===year).reduce((largest,quote)=>Math.max(largest,quote.number),0)+1;
}

export function formatQuoteNumber(year:number,number:number,prefix="PROP"):string {
  if(!Number.isInteger(number)||number<1)throw new Error("Número da proposta inválido");
  return `${prefix}-${year}-${String(number).padStart(6,"0")}`;
}

export function transitionQuote(quote:QuoteRecord,status:QuoteStatus,at:string,reason:null|string=null):QuoteRecord {
  if(quote.status===status)return quote;
  if(!transitions[quote.status].includes(status))throw new Error(`Transição de proposta inválida: ${quote.status} -> ${status}`);
  if(status==="expired"&&new Date(at).getTime()<new Date(quote.expiresAt).getTime())throw new Error("Proposta ainda não atingiu a validade");
  return {...quote,status,updatedAt:at,sentAt:status==="sent"?at:quote.sentAt,decidedAt:["accepted","declined","expired"].includes(status)?at:quote.decidedAt,statusReason:reason};
}

export function createQuoteVersion(quote:QuoteRecord,existingQuotes:readonly QuoteRecord[],id:string,at:string):QuoteRecord {
  if(!id.trim()||existingQuotes.some(item=>item.id===id))throw new Error("Id da versão da proposta inválido ou duplicado");
  const rootQuoteId=quote.rootQuoteId||quote.id;
  const version=existingQuotes.filter(item=>(item.rootQuoteId||item.id)===rootQuoteId).reduce((largest,item)=>Math.max(largest,item.version),quote.version)+1;
  return {...structuredClone(quote),id,rootQuoteId,version,supersedesQuoteId:quote.id,status:"draft",createdAt:at,updatedAt:at,sentAt:null,decidedAt:null,statusReason:null};
}

function assertMinor(label:string,value:number){if(!Number.isSafeInteger(value)||value<0)throw new Error(`${label} deve ser inteiro não negativo em centavos`)}
