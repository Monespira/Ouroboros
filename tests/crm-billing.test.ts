import assert from "node:assert/strict";
import test from "node:test";
import { createInvoiceFromQuote, recordInvoicePayment, refreshOverdueInvoices, sendInvoice } from "../lib/crm/billing";
import { emptyCrmDomain, type QuoteRecord } from "../lib/crm/domain";

const at="2026-08-02T12:00:00.000Z";
const acceptedQuote:QuoteRecord={id:"quote-1",workspaceId:"w1",createdAt:at,updatedAt:at,deletedAt:null,number:1,year:2026,displayNumber:"PROP-2026-000001",customerId:"customer-1",opportunityId:null,currency:"BRL",issueDate:at,expiresAt:"2026-09-01T00:00:00.000Z",status:"accepted",version:1,rootQuoteId:"quote-1",supersedesQuoteId:null,items:[],subtotalMinor:10000,discountMinor:0,taxableMinor:10000,taxMinor:1000,totalMinor:11000,notes:"",terms:"",sentAt:at,decidedAt:at,statusReason:null};

test("converte proposta aceita em invoice numerada",()=>{
  const state={...emptyCrmDomain("w1",at),quotes:[acceptedQuote]};
  const invoice=createInvoiceFromQuote(acceptedQuote,state,{id:"invoice-1",at,dueDate:"2026-09-01T00:00:00.000Z"});
  assert.deepEqual({number:invoice.displayNumber,status:invoice.status,total:invoice.totalMinor,balance:invoice.balanceMinor},{number:"FAT-2026-000001",status:"draft",total:11000,balance:11000});
  assert.throws(()=>createInvoiceFromQuote({...acceptedQuote,status:"sent"},state,{id:"invoice-2",at,dueDate:at}),/aceita/);
});

test("pagamentos parciais atualizam saldo e liquidam invoice",()=>{
  const base=emptyCrmDomain("w1",at);
  const invoice=sendInvoice(createInvoiceFromQuote(acceptedQuote,{...base,quotes:[acceptedQuote]},{id:"invoice-1",at,dueDate:"2026-09-01T00:00:00.000Z"}),at);
  const partial=recordInvoicePayment({...base,invoices:[invoice]},{id:"payment-1",invoiceId:invoice.id,amountMinor:4000,date:at,reference:"PIX",description:"Entrada"});
  assert.deepEqual({status:partial.invoices[0]?.status,paid:partial.invoices[0]?.paidMinor,balance:partial.invoices[0]?.balanceMinor},{status:"partially_paid",paid:4000,balance:7000});
  const paid=recordInvoicePayment(partial,{id:"payment-2",invoiceId:invoice.id,amountMinor:7000,date:at,reference:"PIX",description:"Saldo"});
  assert.equal(paid.invoices[0]?.status,"paid");
  assert.equal(paid.payments.length,2);
  assert.throws(()=>recordInvoicePayment(partial,{id:"payment-x",invoiceId:invoice.id,amountMinor:8000,date:at,reference:"",description:""}),/excede/);
});

test("marca invoice enviada vencida sem alterar invoices pagas",()=>{
  const base=emptyCrmDomain("w1",at);
  const sent={...sendInvoice(createInvoiceFromQuote(acceptedQuote,{...base,quotes:[acceptedQuote]},{id:"invoice-1",at,dueDate:"2026-08-03T00:00:00.000Z"}),at)};
  const refreshed=refreshOverdueInvoices({...base,invoices:[sent]},"2026-08-04T00:00:00.000Z");
  assert.equal(refreshed.invoices[0]?.status,"overdue");
});
