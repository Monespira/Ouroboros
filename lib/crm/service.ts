import { appendAudit, assertWorkspace, type CrmDomainState, type LeadRecord, type RoleAssignment } from "./domain";
import { authorize, type CrmAction } from "./rbac";

export type Actor = { userId:string; workspaceId:string; teamId:null|string };

export class CrmDomainService {
  constructor(private state:CrmDomainState) {}

  snapshot(actor:Actor):CrmDomainState {
    this.assertActorWorkspace(actor);
    return structuredClone(this.state);
  }

  listLeads(actor:Actor):LeadRecord[] {
    this.assertActorWorkspace(actor);
    return this.state.leads.filter(lead=>this.allowed(actor,"read",lead.ownerId));
  }

  saveLead(actor:Actor, lead:LeadRecord, correlationId:string, at=new Date().toISOString()):LeadRecord {
    this.assertActorWorkspace(actor);
    assertWorkspace(actor.workspaceId,lead);
    const previous=this.state.leads.find(item=>item.id===lead.id)??null;
    const action:CrmAction=previous?"update":"create";
    if(!this.allowed(actor,action,previous?.ownerId??lead.ownerId))throw new Error("Permissão negada");
    const next={...lead,updatedAt:at};
    this.state={...this.state,leads:previous?this.state.leads.map(item=>item.id===next.id?next:item):[...this.state.leads,next]};
    this.state=appendAudit(this.state,{id:`audit:${correlationId}`,at,actorId:actor.userId,action:`lead.${action}`,object:"lead",recordId:lead.id,before:previous as unknown as Record<string,unknown>|null,after:next as unknown as Record<string,unknown>,origin:"api",correlationId});
    return structuredClone(next);
  }

  private assertActorWorkspace(actor:Actor){if(actor.workspaceId!==this.state.workspaceId)throw new Error("Acesso entre workspaces negado");}
  private allowed(actor:Actor,action:CrmAction,ownerId:string){return authorize(this.state.roles,{workspaceId:actor.workspaceId,userId:actor.userId,teamId:actor.teamId??undefined,object:"lead",action,ownerId});}
}

export function assignmentsForWorkspace(state:CrmDomainState, workspaceId:string):RoleAssignment[]{
  if(state.workspaceId!==workspaceId)throw new Error("Acesso entre workspaces negado");
  return state.roles.filter(item=>item.workspaceId===workspaceId);
}
