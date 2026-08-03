import { CRM_SCHEMA_VERSION, emptyCrmDomain, type CrmDomainState } from "./domain";

export type WorkspaceDocument = { revision:number; updatedAt?:string; updatedBy?:string; data:Record<string,unknown> };

export function readCrmDomain(document:WorkspaceDocument,workspaceId:string,at=new Date().toISOString()):CrmDomainState {
  const extras=isRecord(document.data.crmExtras)?document.data.crmExtras:{};
  const stored=isRecord(extras.crmDomain)?extras.crmDomain:null;
  if(!stored)return emptyCrmDomain(workspaceId,at);
  if(stored.workspaceId!==workspaceId)throw new Error("Estado CRM pertence a outro workspace");
  return {...emptyCrmDomain(workspaceId,String(stored.migratedAt??at)),...stored,schemaVersion:CRM_SCHEMA_VERSION,workspaceId,leads:array(stored.leads),accounts:array(stored.accounts),contacts:array(stored.contacts),customers:array(stored.customers),products:array(stored.products),quotes:array(stored.quotes),invoices:array(stored.invoices),payments:array(stored.payments),taxes:array(stored.taxes),opportunities:array(stored.opportunities),auditLogs:array(stored.auditLogs),roles:array(stored.roles)} as unknown as CrmDomainState;
}

export function writeCrmDomain(document:WorkspaceDocument,expectedRevision:number,state:CrmDomainState,updatedBy:string,updatedAt=new Date().toISOString()):WorkspaceDocument {
  if(document.revision!==expectedRevision)throw new Error(`Conflito de revisão: esperado ${expectedRevision}, atual ${document.revision}`);
  const extras=isRecord(document.data.crmExtras)?document.data.crmExtras:{};
  return {...document,revision:document.revision+1,updatedAt,updatedBy,data:{...document.data,crmExtras:{...extras,crmDomain:structuredClone(state)}}};
}

function isRecord(value:unknown):value is Record<string,unknown>{return typeof value==="object"&&value!==null&&!Array.isArray(value)}
function array(value:unknown):unknown[]{return Array.isArray(value)?structuredClone(value):[]}
