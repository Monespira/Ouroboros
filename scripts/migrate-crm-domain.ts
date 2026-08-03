import { copyFile, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { migrateLegacyCustomers, migrateLegacyProspects, type LegacyAccount, type LegacyContact, type LegacyProspect } from "../lib/crm/migration";
import { readCrmDomain, writeCrmDomain, type WorkspaceDocument } from "../lib/crm/persistence";

type WorkspaceFile=WorkspaceDocument&{data:{crmAccounts?:LegacyAccount[];crmContacts?:LegacyContact[];crmExtras?:{prospects?:LegacyProspect[];[key:string]:unknown};[key:string]:unknown}};
const args=process.argv.slice(2);
const apply=args.includes("--apply");
const workspaceId=readArg("--workspace-id")??process.env.CRM_WORKSPACE_ID;
const sourcePath=resolve(readArg("--file")??"data/workspace.json");

async function main(){
  if(!workspaceId)throw new Error("Informe --workspace-id <id> ou CRM_WORKSPACE_ID");
  const raw=await readFile(sourcePath,"utf8");
  const document=JSON.parse(raw) as WorkspaceFile;
  const extras=document.data.crmExtras??{};
  const at=new Date().toISOString();
  const existing=readCrmDomain(document,workspaceId,at);
  const idFor=(kind:string,id:string)=>`${kind}:${workspaceId}:${id}`;
  const prospects=migrateLegacyProspects({workspaceId,actorId:"system:migration",at,prospects:extras.prospects??[],existing,idFor});
  const customers=migrateLegacyCustomers({workspaceId,actorId:"system:migration",at,accounts:document.data.crmAccounts??[],contacts:document.data.crmContacts??[],existing:prospects.state,idFor});
  console.log(JSON.stringify({mode:apply?"apply":"dry-run",file:sourcePath,workspaceId,report:{prospects:prospects.report,customers:customers.report}},null,2));
  if(apply){
    const backupPath=`${sourcePath}.bak`;
    const temporaryPath=`${sourcePath}.tmp`;
    const next=writeCrmDomain(document,document.revision,customers.state,"system:migration",at) as WorkspaceFile;
    await copyFile(sourcePath,backupPath);
    await writeFile(temporaryPath,`${JSON.stringify(next,null,2)}\n`,"utf8");
    await rename(temporaryPath,sourcePath);
    console.log(JSON.stringify({applied:true,backupPath,revision:next.revision},null,2));
  }
}

function readArg(name:string){const index=args.indexOf(name);return index>=0?args[index+1]:undefined;}

main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
