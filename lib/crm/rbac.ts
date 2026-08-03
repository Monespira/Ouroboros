import type { CrmObject, RecordScope, RoleAssignment, RoleCode } from "./domain";

export type CrmAction = "read"|"create"|"update"|"delete"|"export"|"configure";
type Permission = { object:CrmObject|"*"; actions:CrmAction[]; scope:RecordScope };

const matrix:Record<RoleCode,Permission[]> = {
  administrator:[{object:"*",actions:["read","create","update","delete","export","configure"],scope:"all"}],
  sales_manager:[{object:"lead",actions:["read","create","update","export"],scope:"team"},{object:"account",actions:["read","create","update","export"],scope:"team"},{object:"contact",actions:["read","create","update","export"],scope:"team"},{object:"opportunity",actions:["read","create","update","export"],scope:"team"},{object:"activity",actions:["read","create","update"],scope:"team"},{object:"task",actions:["read","create","update"],scope:"team"},{object:"audit",actions:["read"],scope:"team"}],
  sdr:[{object:"lead",actions:["read","create","update"],scope:"own"},{object:"account",actions:["read"],scope:"team"},{object:"contact",actions:["read","create","update"],scope:"own"},{object:"activity",actions:["read","create","update"],scope:"own"},{object:"task",actions:["read","create","update"],scope:"own"}],
  closer:[{object:"account",actions:["read"],scope:"team"},{object:"contact",actions:["read","update"],scope:"team"},{object:"opportunity",actions:["read","create","update"],scope:"own"},{object:"activity",actions:["read","create","update"],scope:"own"},{object:"task",actions:["read","create","update"],scope:"own"}],
  marketing:[{object:"lead",actions:["read","create","update","export"],scope:"team"},{object:"contact",actions:["read","export"],scope:"team"}],
  support:[{object:"account",actions:["read"],scope:"team"},{object:"contact",actions:["read"],scope:"team"},{object:"activity",actions:["read","create"],scope:"team"}],
  finance:[{object:"account",actions:["read"],scope:"all"},{object:"opportunity",actions:["read"],scope:"all"},{object:"audit",actions:["read"],scope:"all"}],
  viewer:[{object:"lead",actions:["read"],scope:"own"},{object:"account",actions:["read"],scope:"own"},{object:"contact",actions:["read"],scope:"own"},{object:"opportunity",actions:["read"],scope:"own"}],
};

export function authorize(assignments:RoleAssignment[], request:{workspaceId:string;userId:string;object:CrmObject;action:CrmAction;ownerId?:string;teamId?:string}):boolean {
  return assignments.filter(v=>v.workspaceId===request.workspaceId&&v.userId===request.userId).some(assignment=>matrix[assignment.role].some(permission=>{
    if(permission.object!=="*"&&permission.object!==request.object)return false;
    if(!permission.actions.includes(request.action))return false;
    if(permission.scope==="all")return true;
    if(permission.scope==="team")return Boolean(assignment.teamId&&assignment.teamId===request.teamId)||request.ownerId===request.userId;
    return request.ownerId===request.userId;
  }));
}
