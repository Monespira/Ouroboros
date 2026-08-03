import type { CrmDomainState, InvoiceRecord, PaymentRecord, QuoteRecord } from "./domain";

export function createInvoiceFromQuote(quote:QuoteRecord,state:CrmDomainState,input:{id:string;at:string;dueDate:string}):InvoiceRecord {
  if(quote.status!=="accepted")throw new Error("A proposta precisa estar aceita antes da conversão");
  if(state.invoices.some(invoice=>invoice.quoteId===quote.id&&invoice.status!=="cancelled"))throw new Error("A proposta já possui invoice ativa");
  const year=new Date(input.at).getFullYear();
  const number=nextNumber(state.invoices,year);
  return {id:input.id,workspaceId:state.workspaceId,createdAt:input.at,updatedAt:input.at,deletedAt:null,number,year,displayNumber:`FAT-${year}-${String(number).padStart(6,"0")}`,customerId:quote.customerId,quoteId:quote.id,currency:quote.currency,issueDate:input.at,dueDate:input.dueDate,status:"draft",items:structuredClone(quote.items),subtotalMinor:quote.subtotalMinor,discountMinor:quote.discountMinor,taxableMinor:quote.taxableMinor,taxMinor:quote.taxMinor,totalMinor:quote.totalMinor,paidMinor:0,balanceMinor:quote.totalMinor,paymentIds:[],notes:quote.notes,sentAt:null};
}

export function sendInvoice(invoice:InvoiceRecord,at:string):InvoiceRecord {
  if(invoice.status!=="draft")throw new Error("Somente invoices em rascunho podem ser enviadas");
  return {...invoice,status:"sent",sentAt:at,updatedAt:at};
}

export function recordInvoicePayment(state:CrmDomainState,input:{id:string;invoiceId:string;amountMinor:number;date:string;reference:string;description:string}):CrmDomainState {
  if(!Number.isSafeInteger(input.amountMinor)||input.amountMinor<=0)throw new Error("Pagamento deve ser positivo e informado em centavos");
  if(state.payments.some(payment=>payment.id===input.id))throw new Error("Pagamento duplicado");
  const invoice=state.invoices.find(item=>item.id===input.invoiceId);
  if(!invoice)throw new Error("Invoice não encontrada");
  if(["cancelled","paid"].includes(invoice.status))throw new Error("Invoice não aceita pagamentos");
  if(input.amountMinor>invoice.balanceMinor)throw new Error("Pagamento excede o saldo da invoice");
  const year=new Date(input.date).getFullYear();
  const number=nextNumber(state.payments,year);
  const payment:PaymentRecord={id:input.id,workspaceId:state.workspaceId,createdAt:input.date,updatedAt:input.date,deletedAt:null,number,year,displayNumber:`PAG-${year}-${String(number).padStart(6,"0")}`,customerId:invoice.customerId,invoiceId:invoice.id,date:input.date,amountMinor:input.amountMinor,currency:invoice.currency,reference:input.reference,description:input.description};
  const paidMinor=invoice.paidMinor+input.amountMinor;
  const balanceMinor=invoice.totalMinor-paidMinor;
  const updated:InvoiceRecord={...invoice,paidMinor,balanceMinor,paymentIds:[...invoice.paymentIds,payment.id],status:balanceMinor===0?"paid":"partially_paid",updatedAt:input.date};
  return {...state,payments:[...state.payments,payment],invoices:state.invoices.map(item=>item.id===invoice.id?updated:item)};
}

export function refreshOverdueInvoices(state:CrmDomainState,at:string):CrmDomainState {
  const now=new Date(at).getTime();
  return {...state,invoices:state.invoices.map(invoice=>invoice.status==="sent"&&invoice.balanceMinor>0&&new Date(invoice.dueDate).getTime()<now?{...invoice,status:"overdue",updatedAt:at}:invoice)};
}

function nextNumber(records:readonly {year:number;number:number}[],year:number){return records.filter(record=>record.year===year).reduce((largest,record)=>Math.max(largest,record.number),0)+1}
