import assert from "node:assert/strict";
import test from "node:test";
import { emptyCrmDomain, type QuoteRecord } from "../lib/crm/domain";
import { readCrmDomain, writeCrmDomain } from "../lib/crm/persistence";
import { calculateQuote, createQuoteVersion, formatQuoteNumber, nextQuoteNumber, transitionQuote } from "../lib/crm/quotes";

const at="2026-08-02T12:00:00.000Z";
const quote=(status:QuoteRecord["status"]="draft"):QuoteRecord=>({id:"quote-1",workspaceId:"w1",createdAt:at,updatedAt:at,deletedAt:null,number:1,year:2026,displayNumber:"PROP-2026-000001",customerId:"customer-1",opportunityId:null,currency:"BRL",issueDate:"2026-08-02",expiresAt:"2026-09-01T00:00:00.000Z",status,version:1,rootQuoteId:"quote-1",supersedesQuoteId:null,items:[],subtotalMinor:0,discountMinor:0,taxableMinor:0,taxMinor:0,totalMinor:0,notes:"",terms:"",sentAt:status==="sent"?at:null,decidedAt:null,statusReason:null});

test("calcula descontos, impostos e totais em centavos",()=>{
  const result=calculateQuote([
    {id:"item-1",productId:"product-1",sku:"A",name:"Serviço A",description:"",quantity:2,unit:"un",unitPriceMinor:10000,lineDiscountMinor:1000,taxRateBasisPoints:1000},
    {id:"item-2",productId:null,sku:"B",name:"Serviço B",description:"",quantity:1,unit:"un",unitPriceMinor:5000,lineDiscountMinor:0,taxRateBasisPoints:2000},
  ],2400);
  assert.deepEqual({subtotal:result.subtotalMinor,discount:result.discountMinor,taxable:result.taxableMinor,tax:result.taxMinor,total:result.totalMinor},{subtotal:25000,discount:3400,taxable:21600,tax:2610,total:24210});
  assert.equal(result.items[0]?.allocatedDiscountMinor,1900);
  assert.equal(result.items[1]?.allocatedDiscountMinor,500);
});

test("numeração é determinística por ano",()=>{
  const state={...emptyCrmDomain("w1",at),quotes:[quote(),{...quote(),id:"quote-2",number:7,displayNumber:"PROP-2026-000007"},{...quote(),id:"quote-old",year:2025,number:99}]};
  assert.equal(nextQuoteNumber(state,2026),8);
  assert.equal(formatQuoteNumber(2026,8),"PROP-2026-000008");
});

test("máquina de estados aceita somente o fluxo comercial definido",()=>{
  const sent=transitionQuote(quote(),"sent","2026-08-03T00:00:00.000Z");
  const accepted=transitionQuote(sent,"accepted","2026-08-04T00:00:00.000Z");
  assert.equal(accepted.status,"accepted");
  assert.throws(()=>transitionQuote(quote(),"accepted",at),/inválida/);
  assert.throws(()=>transitionQuote(sent,"expired","2026-08-20T00:00:00.000Z"),/validade/);
});

test("nova versão preserva número e volta para draft",()=>{
  const sent=transitionQuote(quote(),"sent","2026-08-03T00:00:00.000Z");
  const revised=createQuoteVersion(sent,[sent],"quote-2","2026-08-04T00:00:00.000Z");
  assert.deepEqual({number:revised.number,version:revised.version,status:revised.status,supersedes:revised.supersedesQuoteId},{number:1,version:2,status:"draft",supersedes:"quote-1"});
});

test("adaptador JSON preserva chaves e aplica revisão otimista",()=>{
  const document={revision:12,updatedAt:at,updatedBy:"old",data:{posts:[{id:"p1"}],crmExtras:{prospects:[{id:"legacy"}],crmDomain:{...emptyCrmDomain("w1",at),products:undefined,quotes:undefined}}}};
  const state=readCrmDomain(document,"w1",at);
  assert.deepEqual(state.products,[]);assert.deepEqual(state.quotes,[]);
  const next=writeCrmDomain(document,12,state,"admin","2026-08-03T00:00:00.000Z");
  assert.equal(next.revision,13);assert.deepEqual(next.data.posts,[{id:"p1"}]);
  assert.deepEqual((next.data.crmExtras as {prospects:unknown[]}).prospects,[{id:"legacy"}]);
  assert.throws(()=>writeCrmDomain(document,11,state,"admin"),/Conflito de revisão/);
});
