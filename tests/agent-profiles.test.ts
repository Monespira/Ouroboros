import test from "node:test";
import assert from "node:assert/strict";
import { agentProfile, profileFiles } from "../lib/agent-profiles";
import { agentModel, agentModels } from "../lib/agent-models";

test("dez perfis possuem papel, escopo, fontes e escalonamento", () => {
  const profiles=profileFiles();
  assert.equal(Object.keys(profiles).length,10);
  for(const specialist of Object.keys(profiles) as Array<keyof typeof profiles>){
    const profile=agentProfile(specialist);
    assert.match(profile,/## Papel/);
    assert.match(profile,/## Escopo de decisão/);
    assert.match(profile,/## Fontes utilizadas/);
    assert.match(profile,/## Regras de escalonamento/);
  }
});

test("orquestrador incorpora mapa de roteamento",()=>{
  assert.match(agentProfile("orchestrator"),/Mapa de roteamento do Orquestrador-geral/);
  assert.match(agentProfile("orchestrator"),/Exige aprovação humana/);
});

test("agentes comerciais recebem o guia vigente v3", () => {
  const finance = agentProfile("finance");
  assert.match(finance, /Atualização comercial vigente obrigatória/);
  assert.match(finance, /\*\*Versão:\*\*\s*3\.0/);
  assert.match(finance, /R\$ 476/);
  assert.match(finance, /R\$ 449/);
});

test("cada agente possui um modelo Ollama local próprio", () => {
  assert.equal(Object.keys(agentModels()).length, 10);
  assert.equal(agentModel("finance"), "monespira-financeiro:latest");
  assert.equal(agentModel("security"), "monespira-seguranca:latest");
});
