# Ferramentas de Dev com IA no GCP — Gemini Code Assist & Cloud Assist

## O que é
- **Gemini Code Assist**: AI coding assistant no IDE (dev time). ≈ **Amazon Q Developer / CodeWhisperer**.
- **Gemini Cloud Assist**: AI pra operar/debugar infra em produção (runtime). ≈ **Amazon Q + CloudWatch / modo investigate**.
- Regra de ouro: **Code = no IDE escrevendo código; Cloud = no Console operando o ambiente**.

## Quando usar
- **Code completion, gerar função a partir de comentário, explicar/documentar** → Code Assist.
- **Gerar unit tests, debugging de código** → Code Assist.
- **Root-cause analysis de incidente, achar causa olhando logs/métricas** → Cloud Assist (investigations).
- **AI-assisted observability / troubleshoot em prod** → Cloud Assist.

## Pontos-chave
- Code Assist roda em: VS Code, JetBrains, Android Studio, **Cloud Shell Editor**, **Cloud Workstations** (via Cloud Code).
- Edições: **Individual (free)**, **Standard**, **Enterprise**.
- **Enterprise** adiciona **code customization** = treina/ancora nas suas **repos privadas** (GitHub/GitLab/Bitbucket) → "context engineering".
- **Source citations**: cita a fonte quando copia trecho conhecido.
- **`.aiexclude`**: controla o que a IA enxerga (tipo `.gitignore` pra IA).
- **Agent mode / agentic chat**: tarefas multi-step com ferramentas e **MCP**.
- **Cloud Assist investigations** produz **Observations**: insights ranqueados sobre logs, configs e métricas, com link pra fonte.
- Disparar investigation: **Logs Explorer**, alerta do **Cloud Monitoring**, Cloud Hub, painel de chat do Cloud Assist.

## Comando/CLI (referência)
- Não é CLI-centric; integração principal é IDE + Console.
- Setup IDE: extensão **Cloud Code** + Gemini Code Assist (VS Code / JetBrains).
- Exclusão de contexto: criar arquivo **`.aiexclude`** na raiz do projeto.
- Métricas de uso: **Generate Gemini Code Assist metrics** (Cloud Logging/Monitoring).
- Cloud Assist: botão **"Create investigation"** no Console (sem comando dedicado).

## Pegadinhas de prova
- **Code Assist ≠ Cloud Assist**: "gerar teste/código" = Code; "root cause/troubleshoot/observability" = Cloud.
- **Code customization com repos privados é só Enterprise** — não atribua ao free/Standard.
- **`.aiexclude` e source citations** pertencem ao **Code Assist**, não ao Cloud Assist.
- **Investigations** analisam logs + métricas + configs e geram **Observations** (não "corrige sozinho").
- Cloud Shell Editor e Cloud Workstations já trazem Code Assist — não precisa montar IDE local.

## Fontes
- https://docs.cloud.google.com/gemini/docs/codeassist/overview
- https://docs.cloud.google.com/gemini/docs/codeassist/code-overview
- https://docs.cloud.google.com/gemini/docs/cloud-assist/investigations
- https://www.augmentcode.com/tools/gemini-code-assist-vs-amazon-q-cloud-native-fit-and-toolchains
