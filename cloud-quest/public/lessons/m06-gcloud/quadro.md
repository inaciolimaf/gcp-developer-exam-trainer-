# 06 — gcloud CLI

## O que é
- **gcloud CLI**: ferramenta de linha de comando para gerenciar recursos do Google Cloud (criar, ler, atualizar, deletar, deploy).
- Âncora AWS: **gcloud ≈ `aws` CLI**. Mesma função, ecossistema GCP.
- Faz parte do **Google Cloud SDK** (junto com gsutil, bq, etc.).

## Quando usar
- Automação, scripting, CI/CD e tarefas repetitivas — mais rápido que o Console.
- Quando o serviço **tem CLI própria**, use a CLI certa:
  - **Cloud Storage** → `gcloud storage` (recomendado) ou **gsutil** (legado).
  - **BigQuery** → **bq**.
  - **Bigtable** → **cbt**.
  - **Kubernetes (GKE)**: **gcloud** cria/gerencia o cluster; **kubectl** gerencia pods/deployments dentro dele.
- **Cloud Shell**: quando quer terminal pronto, sem instalar nada (estudo, tarefas rápidas).

## Pontos-chave
- **`gcloud init`** = bootstrap: autoriza conta + cria uma **configuration** (account, project, region/zone). Primeira config = `default`.
- **Named configurations** ≈ **named profiles** da AWS. Várias (dev/prod), alternáveis.
- **Dois logins distintos**:
  - `gcloud auth login` → autentica **a CLI**.
  - `gcloud auth application-default login` → configura **ADC** para **código/client libraries** locais.
  - A gcloud CLI **não** usa ADC.
- Estrutura: **`gcloud <group> <command> [flags]`** (groups podem ter subgroups). Lê como frase.
- Cloud Shell: gcloud/gsutil/bq/kubectl **pré-instalados e autenticados**; **5 GB** de home persistente, VM efêmera.

## Comando/CLI (referência)
```bash
# Setup
gcloud init                          # autoriza + cria configuration
gcloud auth login                    # autentica a CLI (usuário)
gcloud auth application-default login # ADC p/ código local (client libs)

# Configurations (≈ AWS profiles)
gcloud config configurations create dev
gcloud config configurations activate dev
gcloud config configurations list
gcloud config set project MEU_PROJETO
gcloud config list

# Components (gerenciar partes do SDK)
gcloud components list
gcloud components install kubectl
gcloud components update

# Estrutura group/command + flags globais
gcloud compute instances list
gcloud compute instances list --project=OUTRO_PROJETO
gcloud compute instances list --format=json        # json|yaml|table|value
gcloud compute instances list --filter="zone:us-central1-a"

# CLIs separadas por serviço
gcloud storage ls gs://bucket   # ou: gsutil ls gs://bucket
bq query 'SELECT 1'
kubectl get pods                # dentro do cluster GKE
```

## Pegadinhas de prova
- **`gcloud auth login` ≠ `gcloud auth application-default login`**. CLI vs. ADC (código). Erro clássico.
- gcloud **não** cobre tudo: Storage (`gcloud storage`/gsutil), BigQuery (**bq**), Bigtable (**cbt**) têm ferramentas próprias.
- GKE: **gcloud** = cluster; **kubectl** = pods/deployments. Não troque.
- `--project` muda o alvo **só naquele comando**, sem trocar a configuration ativa.
- Para mudar saída use **`--format`**; para filtrar use **`--filter`** (server-side).
- Cloud Shell: home **5 GB persiste**; software instalado fora da home **não** persiste (VM efêmera).
- `gcloud components` gerencia o SDK; **no Cloud Shell já vem tudo pré-instalado**.

## Fontes
- https://docs.cloud.google.com/sdk/docs/initializing
- https://docs.cloud.google.com/docs/authentication/gcloud
- https://docs.cloud.google.com/sdk/docs/cheatsheet
