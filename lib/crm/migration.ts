import { appendAudit, emptyCrmDomain, type CrmDomainState, type CustomerContact, type CustomerRecord, type LeadRecord } from "./domain";

export type LegacyProspect = { id:string; company?:string; decisionMaker?:string; whatsapp?:string; instagram?:string; segment?:string; location?:string; source?:string; score?:number; priority?:string; owner?:string; firstContactAt?:string; lastContactAt?:string; nextAction?:string; nextActionAt?:string; notes?:string; estimatedValue?:number; stage?:string };
export type MigrationReport = { sourceCount:number; leadCount:number; ambiguousProspectIds:string[]; duplicateKeys:string[]; estimatedValueTotal:number };
export type LegacyAccount = { id:string; name?:string; owner?:string; industry?:string; website?:string; phone?:string; location?:string; relationship?:CustomerRecord["relationship"] };
export type LegacyContact = { id:string; accountId?:string; name?:string; email?:string; phone?:string; whatsapp?:string; role?:string; source?:string; tags?:string[]; preferences?:string; active?:boolean; createdAt?:string };
export type CustomerMigrationReport = { accountCount:number; contactCount:number; customerCount:number; updatedCustomerCount:number; orphanContactIds:string[]; skippedSourceIds:string[] };

export function migrateLegacyProspects(input:{workspaceId:string;actorId:string;at:string;prospects:LegacyProspect[];existing?:CrmDomainState;idFor:(kind:string,legacyId:string)=>string}):{state:CrmDomainState;report:MigrationReport} {
  let state=normalizeDomain(input.existing??emptyCrmDomain(input.workspaceId,input.at));
  if(state.workspaceId!==input.workspaceId)throw new Error("Estado pertence a outro workspace");
  const existingLegacyIds=new Set(state.leads.map(v=>v.tags.find(t=>t.startsWith("legacy:"))?.slice(7)).filter(Boolean));
  const duplicateKeys:string[]=[]; const seen=new Set<string>(); const ambiguousProspectIds:string[]=[]; let estimatedValueTotal=0;
  const leads:LeadRecord[]=[];
  for(const source of input.prospects){estimatedValueTotal+=Number(source.estimatedValue)||0;if(existingLegacyIds.has(source.id))continue;const key=normalize(`${source.company}|${source.whatsapp}|${source.instagram}`);if(seen.has(key))duplicateKeys.push(key);seen.add(key);if(source.stage&&!["Lead identificado","Qualificado"].includes(source.stage))ambiguousProspectIds.push(source.id);const at=input.at;leads.push({id:input.idFor("lead",source.id),workspaceId:input.workspaceId,createdAt:at,updatedAt:at,deletedAt:null,status:(source.score??0)>=7?"qualified":"new",companyName:source.company??"",name:source.decisionMaker??"",email:"",whatsapp:source.whatsapp??"",instagram:source.instagram??"",website:"",location:source.location??"",segment:source.segment??"",source:source.source??"",campaignId:null,score:Math.min(10,Math.max(0,source.score??0)),scoreContributions:[{ruleId:"legacy-score",label:"Pontuação importada do CRM anterior",points:source.score??0,evidence:`Registro ${source.id}`}],priority:source.priority==="Alta"?"high":source.priority==="Média"?"medium":"low",ownerId:source.owner??input.actorId,firstContactAt:source.firstContactAt||null,lastContactAt:source.lastContactAt||null,nextAction:source.nextAction??"",nextActionDueAt:source.nextActionAt||null,consent:"unknown",preferredChannel:source.whatsapp?"WhatsApp":"",tags:[`legacy:${source.id}`],notes:source.notes??"",convertedAt:null,convertedAccountId:null,convertedContactId:null,convertedOpportunityId:null});}
  state={...state,leads:[...state.leads,...leads]};
  if(leads.length)state=appendAudit(state,{id:input.idFor("audit",`${input.at}-${leads.length}`),at:input.at,actorId:input.actorId,action:"migration.crm_v1_to_v2",object:"admin",recordId:input.workspaceId,before:{sourceCount:input.prospects.length},after:{createdLeads:leads.length,ambiguous:ambiguousProspectIds.length},origin:"migration",correlationId:`crm-migration-${input.at}`});
  return {state,report:{sourceCount:input.prospects.length,leadCount:leads.length,ambiguousProspectIds,duplicateKeys:[...new Set(duplicateKeys)],estimatedValueTotal}};
}

export function migrateLegacyCustomers(input:{workspaceId:string;actorId:string;at:string;accounts:LegacyAccount[];contacts:LegacyContact[];existing?:CrmDomainState;idFor:(kind:string,legacyId:string)=>string}):{state:CrmDomainState;report:CustomerMigrationReport} {
  let state=normalizeDomain(input.existing??emptyCrmDomain(input.workspaceId,input.at));
  if(state.workspaceId!==input.workspaceId)throw new Error("Estado pertence a outro workspace");
  const migratedAccounts=new Set(state.customers.map(customer=>customer.legacyAccountId).filter((id):id is string=>Boolean(id)));
  const migratedContacts=new Set(state.customers.flatMap(customer=>customer.legacyContactIds));
  const contactsByAccount=new Map<string,LegacyContact[]>();
  for(const contact of input.contacts){if(contact.accountId){const list=contactsByAccount.get(contact.accountId)??[];list.push(contact);contactsByAccount.set(contact.accountId,list)}}
  const customers:CustomerRecord[]=[];
  const customerUpdates=new Map<string,CustomerRecord>();
  const skippedSourceIds:string[]=[];
  for(const account of input.accounts){
    const contacts=(contactsByAccount.get(account.id)??[]).filter(contact=>!migratedContacts.has(contact.id));
    const existingCustomer=state.customers.find(customer=>customer.legacyAccountId===account.id);
    if(existingCustomer){
      skippedSourceIds.push(`account:${account.id}`);
      if(contacts.length){
        const appended=contacts.map(contact=>customerContact(input,contact));
        const primary=existingCustomer.primaryContactId?null:appended[0]??null;
        customerUpdates.set(existingCustomer.id,{...existingCustomer,updatedAt:input.at,email:existingCustomer.email||primary?.email||"",phone:existingCustomer.phone||primary?.phone||"",whatsapp:existingCustomer.whatsapp||primary?.whatsapp||"",primaryContactId:existingCustomer.primaryContactId??primary?.id??null,contacts:[...existingCustomer.contacts,...appended],legacyContactIds:[...existingCustomer.legacyContactIds,...contacts.map(contact=>contact.id)]});
      }
      continue;
    }
    customers.push(customerFromAccount(input,account,contacts));
  }
  const knownAccountIds=new Set(input.accounts.map(account=>account.id));
  const orphanContacts=input.contacts.filter(contact=>(!contact.accountId||!knownAccountIds.has(contact.accountId))&&!migratedContacts.has(contact.id));
  for(const contact of orphanContacts)customers.push(customerFromOrphanContact(input,contact));
  for(const contact of input.contacts){if(migratedContacts.has(contact.id))skippedSourceIds.push(`contact:${contact.id}`)}
  state={...state,customers:[...state.customers.map(customer=>customerUpdates.get(customer.id)??customer),...customers]};
  if(customers.length||customerUpdates.size)state=appendAudit(state,{id:input.idFor("audit",`customers-${input.at}-${customers.length}-${customerUpdates.size}`),at:input.at,actorId:input.actorId,action:"migration.crm_accounts_contacts_to_customers",object:"admin",recordId:input.workspaceId,before:{accountCount:input.accounts.length,contactCount:input.contacts.length},after:{createdCustomers:customers.length,updatedCustomers:customerUpdates.size,orphanContacts:orphanContacts.length},origin:"migration",correlationId:`crm-customer-migration-${input.at}`});
  return {state,report:{accountCount:input.accounts.length,contactCount:input.contacts.length,customerCount:customers.length,updatedCustomerCount:customerUpdates.size,orphanContactIds:orphanContacts.map(contact=>contact.id),skippedSourceIds:[...new Set(skippedSourceIds)]}};
}

function customerFromAccount(input:{workspaceId:string;actorId:string;at:string;idFor:(kind:string,legacyId:string)=>string},account:LegacyAccount,contacts:LegacyContact[]):CustomerRecord {
  const customerContacts=contacts.map(contact=>customerContact(input,contact));
  const primary=customerContacts[0]??null;
  return {id:input.idFor("customer",account.id),workspaceId:input.workspaceId,createdAt:input.at,updatedAt:input.at,deletedAt:null,customerType:"organization",name:account.name??"",normalizedName:normalize(account.name??""),legalName:"",taxId:"",email:primary?.email??"",phone:account.phone??primary?.phone??"",whatsapp:primary?.whatsapp??"",website:account.website??"",address:{line1:"",line2:"",city:account.location??"",state:"",postalCode:"",country:"BR"},segment:account.industry??"",ownerId:account.owner??input.actorId,relationship:account.relationship??"prospect",primaryContactId:primary?.id??null,contacts:customerContacts,tags:[],notes:"",legacyAccountId:account.id,legacyContactIds:contacts.map(contact=>contact.id)};
}

function customerFromOrphanContact(input:{workspaceId:string;actorId:string;at:string;idFor:(kind:string,legacyId:string)=>string},contact:LegacyContact):CustomerRecord {
  const embedded=customerContact(input,contact);
  return {id:input.idFor("customer",`contact-${contact.id}`),workspaceId:input.workspaceId,createdAt:contact.createdAt||input.at,updatedAt:input.at,deletedAt:null,customerType:"individual",name:contact.name??"",normalizedName:normalize(contact.name??""),legalName:"",taxId:"",email:contact.email??"",phone:contact.phone??"",whatsapp:contact.whatsapp??"",website:"",address:{line1:"",line2:"",city:"",state:"",postalCode:"",country:"BR"},segment:"",ownerId:input.actorId,relationship:"prospect",primaryContactId:embedded.id,contacts:[embedded],tags:contact.tags??[],notes:contact.preferences??"",legacyAccountId:null,legacyContactIds:[contact.id]};
}

function customerContact(input:{workspaceId:string;at:string;idFor:(kind:string,legacyId:string)=>string},contact:LegacyContact):CustomerContact {
  const createdAt=contact.createdAt||input.at;
  return {id:input.idFor("customer-contact",contact.id),legacyContactId:contact.id,name:contact.name??"",email:contact.email??"",phone:contact.phone??"",whatsapp:contact.whatsapp??"",role:contact.role??"",preferredChannel:contact.whatsapp?"WhatsApp":contact.email?"Email":"",notes:contact.preferences??"",active:contact.active??true,createdAt,updatedAt:input.at};
}

function normalizeDomain(state:CrmDomainState):CrmDomainState{return {...state,customers:Array.isArray(state.customers)?state.customers:[],products:Array.isArray(state.products)?state.products:[],quotes:Array.isArray(state.quotes)?state.quotes:[],invoices:Array.isArray(state.invoices)?state.invoices:[],payments:Array.isArray(state.payments)?state.payments:[],taxes:Array.isArray(state.taxes)?state.taxes:[]}}
function normalize(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
