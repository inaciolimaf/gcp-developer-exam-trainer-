# 29 — Seguranca no Google Cloud (PCD)

## O que é
Camadas de seguranca aplicadas em cima do IAM (defense in depth). Servicos-chave do modulo para o PCD:

- **Secret Manager** — armazena secrets (passwords, API keys, certs) fora do codigo; acesso via API. Equivalente AWS: Secrets Manager.
- **Binary Authorization** — controle de deploy por policy: so imagens assinadas/atestadas sobem.
- **Container Scanning API** — escaneia imagens no Artifact/Container Registry buscando CVEs.
- **Web Security Scanner** — DAST: testa o app web rodando (XSS, mixed content, libs JS antigas). Faz parte do Security Command Center. Analogo AWS: Inspector.
- **VPC Service Controls** — service perimeter contra data exfiltration, independente do IAM.

## Quando usar
| Necessidade | Servico |
|---|---|
| Guardar senha / API key / cert fora do codigo | Secret Manager |
| Garantir que so container confiavel/assinado faca deploy | Binary Authorization |
| Achar CVE em imagem de container | Container Scanning API |
| Testar app web no ar (XSS, mixed content) | Web Security Scanner |
| Impedir copiar/exfiltrar dados mesmo com acesso IAM | VPC Service Controls |
| DDoS / OWASP Top 10 no load balancer | Cloud Armor |
| Painel central de postura de seguranca | Security Command Center |

## Pontos-chave
- **Secret Manager**: secrets têm **versions** (pede version fixa ou `latest`); **rotation** via rotation schedule: na hora dispara mensagem `SECRET_ROTATE` no Pub/Sub e uma Cloud Function gera/adiciona a nova version; role de leitura `roles/secretmanager.secretAccessor` na service account, no secret especifico (least privilege); cripto por padrao, opcional CMEK via Cloud KMS.
- **Binary Authorization**: roda em **GKE, Cloud Run, Cloud Service Mesh, Google Distributed Cloud**; policy avaliada antes do deploy; **attestors** assinam que a imagem passou por uma etapa (ex.: scan); bloqueio registrado em Cloud Audit Logs.
- **Web Security Scanner**: App Engine, Compute Engine, GKE; detecta XSS, Flash injection, mixed content (HTTP em HTTPS), libs desatualizadas.
- **VPC Service Controls**: protege BigQuery, Cloud Storage e outros; **independente do IAM**; combina com IAM = defense in depth.

## Comando/CLI (referência)
```bash
# Secret Manager — criar secret e adicionar versions
gcloud secrets create db-password --replication-policy="automatic"
echo -n "s3nh4" | gcloud secrets versions add db-password --data-file=-

# Conceder acesso (least privilege: no secret, para a SA do app)
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:app@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Ler valor (version especifica ou 'latest')
gcloud secrets versions access latest --secret="db-password"

# Container Scanning — disparar scan e listar vulnerabilidades
gcloud artifacts docker images scan IMAGE_URL
gcloud artifacts docker images list-vulnerabilities SCAN_ID

# Acesso a secret em codigo (Python) — conceito; detalhe vai aqui no quadro
# client.access_secret_version(name="projects/P/secrets/S/versions/latest")
```

## Pegadinhas de prova
- **VPC Service Controls ≠ IAM e ≠ firewall.** IAM = quem acessa; VPC SC = impede **exfiltration** mesmo de quem tem acesso. Se a questao fala "usuario tem acesso por IAM mas nao pode copiar os dados pra fora", e VPC Service Controls.
- **Binary Authorization** = so imagens **assinadas/atestadas** fazem deploy (controle de deploy). Nao confunda com Container Scanning, que so **encontra** vulnerabilidades. O scan alimenta o attestor.
- **Web Security Scanner** e **DAST** (app rodando), nao escaneia imagem de container. Imagem = Container Scanning API.
- **Secret Manager**: voce nao edita um secret, **adiciona uma version**. Pedir `latest` pega sempre a mais nova.
- Role de leitura e `secretmanager.secretAccessor` — dar no **secret**, nao no projeto.
- **Cloud Armor** atua no **load balancer** (DDoS/OWASP), nao protege dados em repouso.

## Fontes
- https://docs.cloud.google.com/secret-manager/docs/overview
- https://docs.cloud.google.com/binary-authorization/docs/overview
- https://docs.cloud.google.com/vpc-service-controls/docs/overview
- https://docs.cloud.google.com/security-command-center/docs/concepts-web-security-scanner-overview
