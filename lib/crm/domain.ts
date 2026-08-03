export const CRM_SCHEMA_VERSION = 2 as const;

export type CrmObject = "lead"|"account"|"contact"|"customer"|"product"|"quote"|"opportunity"|"activity"|"task"|"audit"|"admin";
export type LeadStatus = "new"|"enriching"|"ready_to_qualify"|"qualifying"|"qualified"|"disqualified"|"nurturing"|"converted";
export type OpportunityStage = "contact_started"|"diagnosis"|"meeting"|"solution_defined"|"proposal"|"negotiation"|"awaiting_decision"|"won"|"lost";
export type RecordScope = "own"|"team"|"all";

export type BaseRecord = { id:string; workspaceId:string; createdAt:string; updatedAt:string; deletedAt:null|string };
export type ScoreContribution = { ruleId:string; label:string; points:number; evidence:string };
export type LeadRecord = BaseRecord & { status:LeadStatus; companyName:string; name:string; email:string; whatsapp:string; instagram:string; website:string; location:string; segment:string; source:string; campaignId:null|string; score:number; scoreContributions:ScoreContribution[]; priority:"low"|"medium"|"high"; ownerId:string; firstContactAt:null|string; lastContactAt:null|string; nextAction:string; nextActionDueAt:null|string; consent:"unknown"|"granted"|"denied"; preferredChannel:string; tags:string[]; notes:string; convertedAt:null|string; convertedAccountId:null|string; convertedContactId:null|string; convertedOpportunityId:null|string };
export type AccountRecord = BaseRecord & { name:string; normalizedName:string; segment:string; location:string; instagram:string; website:string; phone:string; ownerId:string; relationship:"prospect"|"customer"|"former_customer"|"partner"|"supplier"|"competitor" };
export type ContactRecord = BaseRecord & { accountId:string; name:string; email:string; phone:string; whatsapp:string; role:string; decisionPower:string; influence:string; preferredChannel:string; consent:"unknown"|"granted"|"denied"; notes:string };
export type CustomerContact = { id:string; legacyContactId:null|string; name:string; email:string; phone:string; whatsapp:string; role:string; preferredChannel:string; notes:string; active:boolean; createdAt:string; updatedAt:string };
export type CustomerRecord = BaseRecord & { customerType:"organization"|"individual"; name:string; normalizedName:string; legalName:string; taxId:string; email:string; phone:string; whatsapp:string; website:string; address:{line1:string;line2:string;city:string;state:string;postalCode:string;country:string}; segment:string; ownerId:string; relationship:"prospect"|"customer"|"former_customer"|"partner"|"supplier"|"competitor"; primaryContactId:null|string; contacts:CustomerContact[]; tags:string[]; notes:string; legacyAccountId:null|string; legacyContactIds:string[] };
export type ProductRecord = BaseRecord & { sku:string; name:string; description:string; unit:string; active:boolean; currency:string; unitPriceMinor:number; taxRateBasisPoints:number };
export type QuoteStatus = "draft"|"sent"|"accepted"|"declined"|"expired";
export type QuoteItem = { id:string; productId:null|string; sku:string; name:string; description:string; quantity:number; unit:string; unitPriceMinor:number; lineDiscountMinor:number; allocatedDiscountMinor:number; discountMinor:number; taxRateBasisPoints:number; subtotalMinor:number; taxableMinor:number; taxMinor:number; totalMinor:number };
export type QuoteRecord = BaseRecord & { number:number; year:number; displayNumber:string; customerId:string; opportunityId:null|string; currency:string; issueDate:string; expiresAt:string; status:QuoteStatus; version:number; rootQuoteId:string; supersedesQuoteId:null|string; items:QuoteItem[]; subtotalMinor:number; discountMinor:number; taxableMinor:number; taxMinor:number; totalMinor:number; notes:string; terms:string; sentAt:null|string; decidedAt:null|string; statusReason:null|string };
export type InvoiceStatus = "draft"|"sent"|"partially_paid"|"paid"|"overdue"|"cancelled";
export type InvoiceRecord = BaseRecord & { number:number; year:number; displayNumber:string; customerId:string; quoteId:null|string; currency:string; issueDate:string; dueDate:string; status:InvoiceStatus; items:QuoteItem[]; subtotalMinor:number; discountMinor:number; taxableMinor:number; taxMinor:number; totalMinor:number; paidMinor:number; balanceMinor:number; paymentIds:string[]; notes:string; sentAt:null|string };
export type PaymentRecord = BaseRecord & { number:number; year:number; displayNumber:string; customerId:string; invoiceId:string; date:string; amountMinor:number; currency:string; reference:string; description:string };
export type TaxRecord = BaseRecord & { name:string; rateBasisPoints:number; active:boolean; isDefault:boolean };
export type Customer = CustomerRecord;
export type Product = ProductRecord;
export type Quote = QuoteRecord;
export type OpportunityRecord = BaseRecord & { accountId:string; name:string; ownerId:string; stage:OpportunityStage; estimatedValue:number; closedValue:number; probability:number; probabilityOverride:null|{value:number;reason:string;actorId:string;at:string}; expectedCloseDate:string; actualCloseDate:null|string; nextAction:string; nextActionDueAt:string; problem:string; solution:string; budget:string; risk:"low"|"medium"|"high"; lossReason:null|string; primaryContactId:null|string };
export type AuditLog = BaseRecord & { actorId:string; action:string; object:CrmObject; recordId:string; before:Record<string,unknown>|null; after:Record<string,unknown>|null; origin:"ui"|"api"|"automation"|"migration"; correlationId:string };

export type CrmDomainState = { schemaVersion:typeof CRM_SCHEMA_VERSION; workspaceId:string; migratedAt:string; leads:LeadRecord[]; accounts:AccountRecord[]; contacts:ContactRecord[]; customers:CustomerRecord[]; products:ProductRecord[]; quotes:QuoteRecord[]; invoices:InvoiceRecord[]; payments:PaymentRecord[]; taxes:TaxRecord[]; opportunities:OpportunityRecord[]; auditLogs:AuditLog[]; roles:RoleAssignment[] };
export type RoleCode = "administrator"|"sales_manager"|"sdr"|"closer"|"marketing"|"support"|"finance"|"viewer";
export type RoleAssignment = { userId:string; workspaceId:string; role:RoleCode; teamId:null|string };

export function emptyCrmDomain(workspaceId:string, migratedAt=new Date().toISOString()):CrmDomainState {
  if (!workspaceId.trim()) throw new Error("workspaceId é obrigatório");
  return {schemaVersion:CRM_SCHEMA_VERSION,workspaceId,migratedAt,leads:[],accounts:[],contacts:[],customers:[],products:[],quotes:[],invoices:[],payments:[],taxes:[],opportunities:[],auditLogs:[],roles:[]};
}

export function assertWorkspace<T extends {workspaceId:string}>(workspaceId:string, record:T):T {
  if (record.workspaceId!==workspaceId) throw new Error("Acesso entre workspaces negado");
  return record;
}

export function appendAudit(state:CrmDomainState, event:Omit<AuditLog,keyof BaseRecord|"workspaceId"> & {id:string;at:string}):CrmDomainState {
  const base={id:event.id,workspaceId:state.workspaceId,createdAt:event.at,updatedAt:event.at,deletedAt:null};
  const log:AuditLog={...base,actorId:event.actorId,action:event.action,object:event.object,recordId:event.recordId,before:maskSensitive(event.before),after:maskSensitive(event.after),origin:event.origin,correlationId:event.correlationId};
  return {...state,auditLogs:[...state.auditLogs,log]};
}

function maskSensitive(value:Record<string,unknown>|null):Record<string,unknown>|null {
  if (!value) return null;
  return Object.fromEntries(Object.entries(value).map(([key,item])=>{
    if (/token|secret|password|credential/i.test(key)) return [key,"[REDACTED]"];
    if (Array.isArray(item)) return [key,item.map(entry=>isRecord(entry)?maskSensitive(entry):entry)];
    return [key,isRecord(item)?maskSensitive(item):item];
  }));
}

function isRecord(value:unknown):value is Record<string,unknown> {
  return typeof value==="object"&&value!==null&&!Array.isArray(value);
}
