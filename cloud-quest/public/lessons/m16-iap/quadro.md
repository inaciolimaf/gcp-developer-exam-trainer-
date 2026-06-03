# 16 — Identity-Aware Proxy (IAP)

## O que é

Proxy gerenciado que protege aplicações por **identidade** (modelo zero-trust / BeyondCorp), não por perímetro de rede. Fica **na frente** do app e intercepta toda requisição: autentica via OAuth 2.0 (conta Google) e autoriza via **IAM** antes do tráfego chegar no backend.

- Equivalente AWS: **AWS Verified Access** / padrão **ALB + Cognito**.
- Principal vantagem: acesso a apps internos **sem VPN e sem bastion host**.
- Protege: **App Engine, Cloud Run, GKE, Compute Engine e apps on-premises**.

## Quando usar

- Expor app interno para usuários sem montar VPN.
- Centralizar authn/authz fora do código da aplicação.
- SSH/RDP em VM **sem IP público** (IAP TCP forwarding).
- Aplicar **context-aware access**: liberar só de certos IPs/regiões ou dispositivos confiáveis.

## Pontos-chave

- **Fluxo**: não autenticado → redirect pro login OAuth 2.0. Autenticado → compara role IAM do usuário com a política do recurso → libera/bloqueia.
- **Role web app**: `roles/iap.httpsResourceAccessor` (IAP-secured Web App User).
- **Role túnel/VM**: `roles/iap.tunnelResourceAccessor` (IAP-secured Tunnel User).
- **Identidade no backend** via headers: `X-Goog-Authenticated-User-Email` e `X-Goog-Authenticated-User-Id`.
- **Signed headers (seguro)**: JWT assinado em `X-Goog-IAP-JWT-Assertion`. App valida assinatura contra chaves públicas do Google e confere o `audience`.
- **Context-aware access**: Access Levels (Access Context Manager) + IAM Conditions na role binding (IP, região, postura do dispositivo).
- **LB**: App Engine e Cloud Run dá pra habilitar **sem** LB; Compute Engine e GKE passam por Cloud Load Balancing.
- **GKE**: Secret (client ID/secret) → `BackendConfig` (iap) → anotação no Service.

## Comando/CLI (referência)

```bash
# Liberar acesso a app web protegido por IAP
gcloud iap web add-iam-policy-binding \
  --resource-type=app-engine \
  --member='user:dev@example.com' \
  --role='roles/iap.httpsResourceAccessor'

# SSH em VM sem IP público (TCP forwarding)
gcloud compute ssh my-vm --tunnel-through-iap --zone=us-central1-a

# Liberar usuário para o túnel TCP
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member='user:dev@example.com' \
  --role='roles/iap.tunnelResourceAccessor'
```

```yaml
# GKE: BackendConfig habilitando IAP a partir de um Secret
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: my-backendconfig
spec:
  iap:
    enabled: true
    oauthclientCredentials:
      secretName: my-secret        # Secret com client_id / client_secret
---
# Service aponta para o BackendConfig
apiVersion: v1
kind: Service
metadata:
  annotations:
    cloud.google.com/backend-config: '{"default": "my-backendconfig"}'
```

```python
# Validar o JWT assinado no backend (signed headers)
from google.auth.transport import requests
from google.oauth2 import id_token

jwt = request.headers.get("X-Goog-IAP-JWT-Assertion")
info = id_token.verify_token(
    jwt, requests.Request(),
    audience=EXPECTED_AUDIENCE,           # /projects/NUM/apps/PROJECT_ID
    certs_url="https://www.gstatic.com/iap/verify/public_key",
)
email = info["email"]
```

## Pegadinhas de prova

- **Headers de texto (`X-Goog-Authenticated-User-*`) NÃO são confiáveis sozinhos** — podem ser forjados se o backend for acessível direto. Use o **JWT assinado** (`X-Goog-IAP-JWT-Assertion`) e valide assinatura + `audience`.
- IAP **não substitui** a autenticação interna de serviço — é authn/authz de **usuário final**.
- "Acessar VM sem IP público / sem bastion / sem VPN" → resposta é **IAP TCP forwarding** (`--tunnel-through-iap`), não Cloud NAT nem VPN.
- Web app vs túnel: roles diferentes — `iap.httpsResourceAccessor` (HTTPS/web) ≠ `iap.tunnelResourceAccessor` (TCP/SSH).
- Context-aware access = **Access Levels + IAM Conditions**, não regras de firewall.
- IAP intercepta **antes** do backend; falha de authz bloqueia sem o código do app rodar.

## Fontes

- https://docs.cloud.google.com/iap/docs/concepts-overview
- https://cloud.google.com/iap/docs/signed-headers-howto
- https://docs.cloud.google.com/iap/docs/cloud-iap-context-aware-access-howto
- https://docs.cloud.google.com/iam/docs/roles-permissions/iap
