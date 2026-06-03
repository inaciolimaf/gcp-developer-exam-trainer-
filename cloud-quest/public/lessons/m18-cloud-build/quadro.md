# 18 — Cloud Build (CI/CD)

## O que é
Serviço serverless de CI/CD do Google Cloud. Executa pipelines de build, test e deploy a partir de um arquivo de configuração.

- Equivalente AWS: **CodeBuild** (execução dos steps) + boa parte do **CodePipeline** (orquestração build → test → deploy).
- Pipeline = **trigger** (acionador) + **cloudbuild.yaml** (workflow).
- Nome de arquivo padrão: `cloudbuild.yaml` (ou `.json`) na raiz do repo. Pode usar nome custom no trigger, YAML inline, ou só um `Dockerfile`.
- **Cada step roda em um container Docker separado** (não é um ambiente único como o CodeBuild).
- Source vem montado em `/workspace`, compartilhado entre todos os steps.

## Quando usar
- CI/CD nativo no GCP: a cada push/PR, buildar imagem → push pro Artifact Registry → deploy em Cloud Run / GKE.
- Build de imagem a partir de Dockerfile sem gerenciar runners.
- Análise estática / quality gate (ex.: Sonar) dentro do CI.
- Builds agendados (trigger manual + Cloud Scheduler) ou disparados por Pub/Sub.
- **Não** use sozinho para deploy avançado multi-cloud (blue-green, canary) → preferir **Spinnaker**.

## Pontos-chave
- **Trigger**: manual, push to branch, pull request, Pub/Sub, webhook.
- **Repos**: Cloud Source Repositories, GitHub, Bitbucket.
- **Builders**: oficiais (docker, gcloud, kubectl, git, mvn, npm, go, gsutil...), community e custom.
  - Community/custom builder precisa estar **publicado no registry do projeto** antes de usar.
- **Ordem dos steps**: serial por padrão. Controla com `id` + `waitFor`.
  - `waitFor: ['-']` → inicia imediatamente; vários assim rodam em **paralelo**.
- **Compartilhar arquivos**: pasta `/workspace` ou Docker volumes.
- **Substitutions**: built-in (`$PROJECT_ID`, `$BUILD_ID`, `$COMMIT_SHA`, `$BRANCH_NAME`, `$REPO_NAME`, `$TAG_NAME`) e custom.
  - **Custom substitution DEVE começar com underscore** (`_MINHA_VAR`).
- **Service account**: o build roda sob uma SA — precisa de roles para deploy (Cloud Run / GKE).
- **Performance**: máquina padrão `e2-standard-2`; `cache-from`, Kaniko cache, `.gcloudignore`, high-CPU.

```yaml
steps:
  # Step 1 — build da imagem
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t',
           '${_REGION}-docker.pkg.dev/$PROJECT_ID/app/img:$COMMIT_SHA', '.']
    id: 'build'
  # Step 2 — push pro Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push',
           '${_REGION}-docker.pkg.dev/$PROJECT_ID/app/img:$COMMIT_SHA']
    waitFor: ['build']
  # Step 3 — deploy no Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args: ['run', 'deploy', 'app', '--image',
           '${_REGION}-docker.pkg.dev/$PROJECT_ID/app/img:$COMMIT_SHA',
           '--region', '${_REGION}']

substitutions:
  _REGION: 'us-central1'      # custom → underscore obrigatório

images:                        # push automático ao final
  - '${_REGION}-docker.pkg.dev/$PROJECT_ID/app/img:$COMMIT_SHA'

options:
  machineType: 'E2_HIGHCPU_8'
```

## Comando/CLI (referência)
```bash
# Build a partir do cloudbuild.yaml (na raiz do repo)
gcloud builds submit --config=cloudbuild.yaml .

# Build direto de um Dockerfile e push (sem yaml)
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPO/IMG:TAG .

# Passar substitutions na linha de comando
gcloud builds submit --substitutions=_REGION=us-central1 .

# Trigger por push num branch (Cloud Source Repository)
gcloud builds triggers create cloud-source-repositories \
  --repo=meu-repo --branch-pattern='^main$' --build-config=cloudbuild.yaml

# Listar builds e ver logs
gcloud builds list
gcloud builds log BUILD_ID
```

## Pegadinhas de prova
- **Cada step = container separado.** Persistência de arquivos só via `/workspace` ou Docker volumes.
- **Custom substitution sem `_` no início → build falha.** Built-in NÃO tem underscore.
- **Community/custom builder não publicado no registry do projeto → build não acha a imagem.**
- **`waitFor: ['-']`** = começa já; **sem `waitFor`** = espera todos os steps anteriores. Não confunda.
- Nome de arquivo padrão é exatamente `cloudbuild.yaml` na raiz.
- Campo `images` empurra imagens pro **Artifact Registry** ao final (se a imagem não for produzida, build falha).
- Deploy falhando por permissão → ajustar **roles da service account** do Cloud Build.
- Deploy blue-green / canary multi-cloud → **Spinnaker**, não Cloud Build puro.
- Acelerar build → `cache-from`, Kaniko cache, `.gcloudignore`, máquina high-CPU (padrão é `e2-standard-2`).

## Fontes
- https://docs.cloud.google.com/build/docs/build-config-file-schema
- https://cloud.google.com/build/docs/configuring-builds/configure-build-step-order
- https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values
- https://cloud.google.com/build/docs/configuring-builds/create-basic-configuration
