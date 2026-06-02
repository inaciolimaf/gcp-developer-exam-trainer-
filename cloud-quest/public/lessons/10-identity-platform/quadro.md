# Identity Platform (CIAM)

> AWS ≈ **Amazon Cognito** (User Pools). **NÃO** é o AWS IAM.

## O que é
- Solução de **CIAM** (Customer Identity and Access Management) do GCP.
- Autenticação de **usuários finais do SEU app** (web / mobile): sign-up, sign-in, sessão, tokens, reset de senha.
- Entrega SDKs (web, iOS, Android) e bibliotecas de UI — você não reimplementa auth.
- É o **backend enterprise do Firebase Authentication** (mesmo motor).

## Quando usar
- App que precisa logar clientes/usuários finais (não funcionários acessando GCP).
- Precisa de **federação corporativa** (OIDC / SAML) para SaaS B2B.
- Precisa de **MFA**, **multi-tenancy**, blocking functions ou audit logging.
- Login social (Google, Facebook, Apple), email/senha, telefone (SMS) ou anônimo.
- Plugar **usuários externos** atrás do **IAP** (Identity-Aware Proxy).

## Pontos-chave
- **Providers**: email/senha, social, telefone/SMS, anônimo, **OIDC** e **SAML** (IdP corporativo).
- **Firebase Auth vs Identity Platform**: Firebase Auth = subconjunto (consumer). Upgrade → desbloqueia MFA, SAML, OIDC genérico, multi-tenancy, blocking functions, audit logs.
- **MFA**: baseado em **SMS**; exige **email verificado** para habilitar.
- **Multi-tenancy**: **tenants** = silos isolados de usuários/config no mesmo projeto. Padrão para **B2B**.
- **IAP**: por padrão usa identidades Google + Cloud IAM; para identidades externas, usa Identity Platform.
- **Pricing**: por **MAU** (monthly active users).

## Comando/CLI (referência)
```bash
# Habilitar a API
gcloud services enable identitytoolkit.googleapis.com

# Criar um tenant (multi-tenancy)
gcloud identity-platform tenants create "Cliente-A" \
  --allow-password-signup

# Listar tenants
gcloud identity-platform tenants list

# Config geralmente feita via Console, Admin SDK ou Terraform
# (google_identity_platform_config / _tenant / _oauth_idp_config)
```

## Pegadinhas de prova
- **Identity Platform ≠ Cloud IAM**. Identity Platform = usuários finais do app (CIAM). Cloud IAM = quem acessa **recursos GCP** (roles, service accounts).
- **Identity Platform ≠ Cloud Identity**. Cloud Identity é IDaaS para gerenciar usuários/grupos da organização (funcionários), não usuários do app.
- Questão pedindo **SAML + MFA + multi-tenancy** num SaaS → **Identity Platform**, não Firebase Auth básico.
- "Usuários externos logando atrás do IAP" → **Identity Platform** plugado no IAP, não IAM puro.
- MFA não habilita sem **email verificado**.

## Fontes
- https://cloud.google.com/security/products/identity-platform
- https://docs.cloud.google.com/identity-platform/docs/multi-tenancy
- https://docs.cloud.google.com/identity-platform/docs/web/mfa
- https://docs.cloud.google.com/docs/authentication/identity-products
