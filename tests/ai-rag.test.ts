import test from "node:test";
import assert from "node:assert/strict";
import { chunkText, ingestRagDocument, retrieveRag } from "../lib/ai-rag";

test("chunking respeita tamanho e overlap", () => {
  const chunks = chunkText("A".repeat(500) + ". " + "B".repeat(500), 400, 50);
  assert.ok(chunks.length >= 2);
  assert.ok(chunks.every((chunk) => chunk.length <= 400));
});

test("chunking rejeita configuração insegura", () => {
  assert.throws(() => chunkText("conteúdo", 100, 100));
});

test("chunking vazio não indexa", () => {
  assert.deepEqual(chunkText("   \n"), []);
});

test("indexação envia embedding e metadata ao Chroma", async (t) => {
  const requests: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url=String(input); requests.push(`${init?.method||"GET"} ${url}`);
    if(url.endsWith("/api/embed")) return Response.json({embeddings:[[0.1,0.2,0.3]]});
    if(url.endsWith("/monespira_knowledge")) return Response.json({id:"collection-test"});
    if(url.endsWith("/collection-test/add")) return Response.json({});
    return new Response(null,{status:404});
  });
  const result=await ingestRagDocument({source:`test:${Date.now()}`,title:"Teste de indexação",documentType:"test",reliability:"teste",content:`Conteúdo único para validar indexação automática ${Date.now()}.`});
  assert.equal(result.chunks,1);
  assert.ok(requests.some((request)=>request.includes("/api/embed")));
  assert.ok(requests.some((request)=>request.endsWith("/collection-test/add")));
});

test("recuperação filtra distância e devolve fonte auditável", async (t) => {
  t.mock.method(globalThis,"fetch",async(input: string | URL | Request)=>{
    const url=String(input);
    if(url.endsWith("/api/embed"))return Response.json({embeddings:[[0.1,0.2,0.3]]});
    if(url.endsWith("/monespira_knowledge"))return Response.json({id:"collection-test"});
    if(url.endsWith("/collection-test/query"))return Response.json({documents:[["Trecho recuperado"]],metadatas:[[{chunk_id:"chunk-1",source:"manual.md",title:"Manual",reliability:"oficial"}]],distances:[[0.2]]});
    return new Response(null,{status:404});
  });
  const result=await retrieveRag("promessa da marca");
  assert.equal(result.length,1);
  assert.equal(result[0].source,"manual.md");
  assert.equal(result[0].id,"chunk-1");
});
