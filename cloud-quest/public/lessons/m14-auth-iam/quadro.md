# 14 — Autenticação e Autorização com Cloud IAM

## O que é
- **Cloud IAM** = controle de quem (member) pode fazer o quê (role) em qual recurso. Primo do **AWS IAM**.
- **authN** (authentication) = "você é quem diz?" → identidade (Google account, service account, token).
- **authZ** (authorization) = "você pode?" → IAM avalia permissão no recurso.
- Modelo: **member** + **role** → **binding** numa **policy** anexada ao recurso.
- **Service account (SA)** = identidade não humana (app/VM). Equivale à IAM role de um EC2 (instance profile). Email + par de chaves RSA, sem senha.
- **ADC** (Application Default Credentials) = estratégia das client libraries para achar credenciais automaticamente.

## Quando usar
- App/VM acessa recurso GCP → **service account anexada** (chaves gerenciadas e rotacionadas pelo Google).
- App **on-premises** → SA com credencial de curta duração; evitar SA key JSON.
- Mesmo código local e prod sem alterar → **ADC**.
- Acesso uniforme no bucket → **IAM**. Acesso por objeto individual → **ACL**.
- Acesso temporário a quem não tem conta Google → **signed URL**.
- Apenas billing/quota, sem identidade → **API key** (não autoriza nada).

## Pontos-chave
- **3 tipos de role**: basic (owner/editor/viewer — amplas, NÃO usar em prod), predefined (granulares, Google-managed, ex.: `storage.objectViewer`), custom.
- SA **default** do Compute/App Engine historicamente vinha com role **Editor** → amplo demais; prefira SA user-managed. (Orgs criadas após mai/2024 não recebem mais o Editor automático.)
- **ADC ordem de busca**: 1) `GOOGLE_APPLICATION_CREDENTIALS`; 2) `gcloud auth application-default login`; 3) metadata server (dentro do GCP). Para na primeira.
- **OAuth scopes ≠ IAM**: camada extra que limita o que o access token alcança.
- **API key NÃO identifica principal** → IAM não consegue autorizar; só liga a request ao projeto (billing/quota).
- Token OAuth de SA expira em **1 hora** por padrão (short-lived).
- **IAM + ACL no GCS**: se qualquer um dos dois conceder acesso, o acesso é concedido.

## Comando/CLI (referência)
```bash
# ADC para desenvolvimento local
gcloud auth application-default login

# Criar service account
gcloud iam service-accounts create my-sa --display-name="App SA"

# Conceder predefined role num bucket (não atribuir permissions soltas)
gsutil iam ch serviceAccount:my-sa@PROJECT.iam.gserviceaccount.com:objectViewer gs://my-bucket

# Anexar SA a uma VM (Compute Engine)
gcloud compute instances create vm1 --service-account=my-sa@PROJECT.iam.gserviceaccount.com --scopes=cloud-platform

# Signed URL (acesso temporário, ex.: 10 min)
gsutil signurl -d 10m KEY.json gs://my-bucket/object.txt

# Ver policy de um recurso
gcloud projects get-iam-policy PROJECT
```

## Pegadinhas de prova
- **authN vs authZ**: IAM é authZ (autorização). Não confunda com login/identidade (authN).
- **API key não autentica app com permissões** → use service account. API key = billing/quota.
- **Basic roles em produção** = errado; resposta certa quase sempre é **predefined role**.
- **OAuth scope ≠ IAM role**: scope limita o token, role concede permissão. São camadas distintas.
- **Não delete uma SA em uso** por VMs em execução → apps perdem acesso aos recursos.
- **SA key JSON** é o caminho menos seguro; preferir ADC / credenciais de curta duração.
- GCS: se você só precisa de permissão **uniforme** no bucket, use IAM; ACL é para granularidade **por objeto**.
- **Metadata server** fornece credenciais automaticamente dentro do GCP — sem hardcode de chave.

## Fontes
- https://docs.cloud.google.com/docs/authentication/application-default-credentials
- https://cloud.google.com/docs/authentication
- https://docs.cloud.google.com/docs/authentication/api-keys
- https://docs.cloud.google.com/iam/docs/service-account-overview
