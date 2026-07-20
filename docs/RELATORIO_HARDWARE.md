# Relatório de hardware para IA local

Data da verificação: 20 de julho de 2026.

## Ambiente verificado

- Sistema operacional: Windows.
- CPU: Intel Core 7 240H, 10 núcleos e 16 processadores lógicos.
- Memória RAM: 31,7 GB instalados; aproximadamente 8 GB livres durante a inspeção.
- GPU dedicada: NVIDIA GeForce RTX 3050 6GB Laptop GPU.
- GPU integrada: Intel Graphics.
- VRAM: o nome do dispositivo informa 6 GB; a interface WMI reportou aproximadamente 4 GB, limitação conhecida desse contador. Validar o uso efetivo com `nvidia-smi` durante benchmarks extensos.
- Armazenamento livre na unidade C: 587,9 GB.
- Ollama: 0.32.1, API local operacional em `127.0.0.1:11434`.
- Docker/WSL2/virtualização: não necessários para esta etapa da integração; verificar antes de implantar n8n, Postgres e pgvector.

## Perfil selecionado

Perfil equilibrado, usando `qwen2.5:7b`. A escolha prioriza português, redação empresarial, planejamento, JSON e uso local dentro dos recursos disponíveis.

## Validação executada

- Modelo presente no inventário local do Ollama.
- Geração direta: resposta correta em português.
- Primeira carga direta observada: aproximadamente 46 segundos.
- Chamada autenticada pelo SCRUB: HTTP 200 em `/api/ai`.
- Modelo confirmado pela aplicação: `qwen2.5:7b`.
- Geração integrada após carga: aproximadamente 10,5 segundos.

## Limites e segurança

- Inferência restrita ao Ollama em loopback; APIs externas de modelos permanecem desativadas.
- A aplicação não instala nem baixa modelos automaticamente.
- Consulta externa opcional aceita somente HTTPS e domínios da allowlist.
- Downloads, anexos, conteúdo binário, redirecionamentos e destinos de rede privada são bloqueados.
- Ações externas ou de alto impacto continuam sujeitas a aprovação humana.

## Próxima etapa arquitetural

n8n, Postgres/pgvector, memória empresarial persistente, auditoria durável e backups pertencem às fases seguintes do prompt mestre e ainda não foram ativados por esta entrega da aba de IAs.
