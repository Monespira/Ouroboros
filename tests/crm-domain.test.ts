import assert from "node:assert/strict";
import test from "node:test";
import { appendAudit, emptyCrmDomain, type LeadRecord } from "../lib/crm/domain";
import { migrateLegacyCustomers, migrateLegacyProspects } from "../lib/crm/migration";
import { authorize } from "../lib/crm/rbac";
import { CrmDomainService } from "../lib/crm/service";

const at="2026-07-21T12:00:00.000Z";
const lead=(workspaceId:string,ownerId="seller"):LeadRecord=>({id:"lead-1",workspaceId,createdAt:at,updatedAt:at,deletedAt:null,status:"new",companyName:"Monespira",name:"Ana",email:"ana@example.com",whatsapp:"5511999999999",instagram:"@monespira",website:"",location:"SP",segment:"Tecnologia",source:"indicação",campaignId:null,score:7,scoreContributions:[],priority:"high",ownerId,firstContactAt:null,lastContactAt:null,nextAction:"Contato",nextActionDueAt:null,consent:"unknown",preferredChannel:"WhatsApp",tags:[],notes:"",convertedAt:null,convertedAccountId:null,convertedContactId:null,convertedOpportunityId:null});

test("RBAC respeita workspace, papel e escopo",()=>{
  const roles=[{userId:"seller",workspaceId:"w1",role:"sdr" as const,teamId:"team-1"}];
  assert.equal(authorize(roles,{workspaceId:"w1",userId:"seller",object:"lead",action:"update",ownerId:"seller"}),true);
  assert.equal(authorize(roles,{workspaceId:"w1",userId:"seller",object:"lead",action:"delete",ownerId:"seller"}),false);
  assert.equal(authorize(roles,{workspaceId:"w2",userId:"seller",object:"lead",action:"read",ownerId:"seller"}),false);
});

test("serviço impede vazamento entre workspaces e registra auditoria",()=>{
  const state={...emptyCrmDomain("w1",at),roles:[{userId:"admin",workspaceId:"w1",role:"administrator" as const,teamId:null}]};
  const service=new CrmDomainService(state);
  assert.throws(()=>service.listLeads({userId:"admin",workspaceId:"w2",teamId:null}),/workspaces/);
  service.saveLead({userId:"admin",workspaceId:"w1",teamId:null},lead("w1","admin"),"corr-1",at);
  const result=service.snapshot({userId:"admin",workspaceId:"w1",teamId:null});
  assert.equal(result.leads.length,1);
  assert.equal(result.auditLogs[0]?.correlationId,"corr-1");
});

test("migração é idempotente e sinaliza estágio ambíguo",()=>{
  const prospects=[{id:"p1",company:"Empresa A",whatsapp:"11999999999",score:8,stage:"Negociação",estimatedValue:5000}];
  const idFor=(kind:string,id:string)=>`${kind}:${id}`;
  const first=migrateLegacyProspects({workspaceId:"w1",actorId:"migration",at,prospects,idFor});
  const second=migrateLegacyProspects({workspaceId:"w1",actorId:"migration",at,prospects,existing:first.state,idFor});
  assert.equal(first.report.leadCount,1);
  assert.deepEqual(first.report.ambiguousProspectIds,["p1"]);
  assert.equal(second.report.leadCount,0);
  assert.equal(second.state.leads.length,1);
});

test("auditoria mascara segredos inclusive em objetos aninhados",()=>{
  const audited=appendAudit(emptyCrmDomain("w1",at),{id:"a1",at,actorId:"admin",action:"test",object:"admin",recordId:"w1",before:null,after:{password:"abc",config:{apiToken:"xyz",safe:"ok"}},origin:"api",correlationId:"c1"});
  assert.equal(audited.auditLogs[0]?.after?.password,"[REDACTED]");
  assert.deepEqual(audited.auditLogs[0]?.after?.config,{apiToken:"[REDACTED]",safe:"ok"});
});

test("migração consolida contas e contatos sem perda e preserva órfãos",()=>{
  const accounts=[{id:"account-1",name:"Monespira",owner:"seller",industry:"Tecnologia",website:"https://example.com"}];
  const contacts=[
    {id:"contact-1",accountId:"account-1",name:"Ana",email:"ana@example.com",phone:"11999990000",role:"CEO",tags:["decisor"]},
    {id:"contact-orphan",accountId:"missing",name:"Bruno",email:"bruno@example.com",preferences:"Contato por e-mail"},
  ];
  const idFor=(kind:string,id:string)=>`${kind}:${id}`;
  const first=migrateLegacyCustomers({workspaceId:"w1",actorId:"migration",at,accounts,contacts,idFor});
  const second=migrateLegacyCustomers({workspaceId:"w1",actorId:"migration",at,accounts,contacts,existing:first.state,idFor});
  assert.equal(first.report.customerCount,2);
  assert.deepEqual(first.report.orphanContactIds,["contact-orphan"]);
  assert.equal(first.state.customers[0]?.legacyAccountId,"account-1");
  assert.deepEqual(first.state.customers[0]?.legacyContactIds,["contact-1"]);
  assert.equal(first.state.customers[0]?.contacts[0]?.email,"ana@example.com");
  assert.equal(first.state.customers[1]?.customerType,"individual");
  assert.equal(first.state.customers[1]?.contacts[0]?.notes,"Contato por e-mail");
  assert.deepEqual(accounts,[{id:"account-1",name:"Monespira",owner:"seller",industry:"Tecnologia",website:"https://example.com"}]);
  assert.equal(second.report.customerCount,0);
  assert.equal(second.state.customers.length,2);
  const withNewContact=migrateLegacyCustomers({workspaceId:"w1",actorId:"migration",at:"2026-07-22T12:00:00.000Z",accounts,contacts:[...contacts,{id:"contact-2",accountId:"account-1",name:"Carla",phone:"11888880000"}],existing:second.state,idFor});
  assert.equal(withNewContact.report.updatedCustomerCount,1);
  assert.deepEqual(withNewContact.state.customers[0]?.legacyContactIds,["contact-1","contact-2"]);
});
