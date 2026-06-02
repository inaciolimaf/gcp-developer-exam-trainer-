# Web Security Scanner (Security Command Center)

> Equivalente AWS: Amazon Inspector (camada de apps web / DAST)

## O que é
- Scanner gerenciado de vulnerabilidades de **aplicações web** (DAST) dentro do **Security Command Center**.
- Faz **crawling** a partir das *starting URLs*, exercita inputs e event handlers, reporta findings.
- Detecta (alinhado ao OWASP Top Ten): **XSS**, **mixed content** (HTTP em página HTTPS), **outdated/insecure libraries**, **clear text password**, **Flash injection**, SQL injection.
- Findings aparecem automaticamente na página **Vulnerabilities** do SCC.

## Quando usar
- Validar segurança de apps web públicos em **App Engine** (standard + flexible), **Compute Engine** e **GKE**.
- Cobertura básica automática da organização → **managed scans**.
- Análise profunda por projeto → **custom scans**.
- Requisito: URL/IP **público**, **IPv4**, não atrás de firewall.

## Pontos-chave
- **Managed scans**: gerenciados pelo SCC (Premium/Enterprise), **semanais**, **sem auth**, **só GET** (não submetem formulários).
- **Custom scans**: você configura (todos os tiers), schedule (daily/weekly/biweekly/4-weeks), auth (Google Account, IAP, custom), findings granulares.
- Autenticação **não suporta 2FA**.
- **max QPS** controla intensidade (requisições/segundo).
- SCC = painel central; Web Security Scanner = fonte de detecção.

## Comando/CLI (referência)
```bash
# Criar custom scan config
gcloud alpha web-security-scanner scan-configs create \
  --display-name="meu-scan" \
  --starting-urls="https://PROJECT_ID.appspot.com" \
  --max-qps=15

# Listar configs e disparar um scan run
gcloud alpha web-security-scanner scan-configs list
gcloud alpha web-security-scanner scan-runs start SCAN_CONFIG_ID
```
- Starting URLs devem ser "owned" pelo projeto (IP reservado ou domínio padrão do App Engine).

## Pegadinhas de prova
- **NÃO rode custom scan em produção sem cuidado**: ele exercita inputs reais → pode postar comentários de teste, gerar emails em massa, criar dados. Use **staging + conta de teste** sem dados sensíveis.
- Managed = **só GET / sem auth / semanal**; custom = pode submeter forms e autenticar.
- Managed scans só em **Premium/Enterprise**; custom em todos os tiers.
- Alvos = **App Engine, Compute Engine, GKE** (não é para apps fora do GCP nem sem URL pública).
- "Qual serviço detecta XSS / outdated libraries em web apps?" → **Web Security Scanner** (não Cloud Armor, não Security Scanner de imagens/Artifact Registry).
- Não confundir com **Container/Artifact Analysis** (vulnerabilidades de imagens) — Web Security Scanner é em runtime da app web.

## Fontes
- https://docs.cloud.google.com/security-command-center/docs/concepts-web-security-scanner-overview
- https://docs.cloud.google.com/security-command-center/docs/how-to-web-security-scanner-custom-scans
- https://docs.cloud.google.com/sdk/gcloud/reference/alpha/web-security-scanner/scan-configs/create
- https://cloud.google.com/blog/products/identity-security/web-application-vulnerability-scans-for-gke-and-compute-engine-are-generally-available
