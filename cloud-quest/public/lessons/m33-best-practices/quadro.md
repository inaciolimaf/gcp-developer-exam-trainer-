# 33 — Best Practices (Google Cloud Developer)

## O que é
Conjunto de boas práticas de desenvolvimento, empacotamento e segurança que o exame PCD cobra: como construir imagens Docker enxutas, versionar com Semantic Versioning, aplicar least privilege com service accounts dedicadas, evitar service account keys, e usar ferramentas de produtividade (Cloud Code, Skaffold, Jib, Cloud Emulators).

Âncora AWS: equivale ao Well-Architected (pilares de Security e Operational Excellence) + least privilege com IAM roles por função em vez de role coringa.

## Quando usar
- Sempre. São defaults de qualidade para qualquer app rodando em GKE, Cloud Run, Cloud Functions ou App Engine.
- Ao montar Dockerfile / pipeline de build (imagem pequena, layering, tags).
- Ao conceder acesso a recursos (Storage, Pub/Sub, etc.) a partir de código.
- Ao desenvolver localmente sem provisionar recursos pagos.

## Pontos-chave
- **Imagem pequena**: prefira base images leves (`alpine`), ou `distroless`/`scratch`. Imagem menor = download, cold start e disco menores.
- **Não copie lixo**: nada de `node_modules`, `target/`, artefatos de build. Só o que roda em produção.
- **Layering**: cada instrução vira uma camada; Docker reaproveita camada não-alterada. Coloque o que muda pouco no topo. Copie `package.json`/`pom.xml`/`requirements.txt` e rode o install ANTES de copiar o código-fonte.
- **Semantic Versioning** nas tags: `major.minor.patch` (major = breaking, minor = feature retrocompatível, patch = bug fix).
- **Não use `latest`**: sempre pin numa versão explícita (reprodutibilidade).
- **Service account dedicada** por função/componente, com apenas as roles necessárias (least privilege). Não use a App Engine default SA (permissões amplas demais).
- **Evite service account keys** sempre que possível; deixe a SA anexada ao recurso e use a identidade automática.
- **Cloud Function**: SA padrão = App Engine default (`PROJECT_ID@appspot.gserviceaccount.com`). Crie SA custom; se ler do Storage, dê role de Storage + permissão de escrita em Cloud Logging e Cloud Monitoring.
- **Cloud Code**: integra build/debug/deploy na IDE (VS Code, IntelliJ, Cloud Shell Editor). Usa Skaffold (loop contínuo em containers) e Jib (imagem Docker otimizada em Java sem Dockerfile).
- **Cloud Emulators**: dev local sem conexão ao GCP — Bigtable, Datastore, Firestore, Pub/Sub, Spanner. (≈ LocalStack na AWS.)
- **Logging/Monitoring**: escreva em stdout/stderr → vai pro Cloud Logging; métricas → Cloud Monitoring automaticamente.

## Comando/CLI (referência)
```bash
# Criar service account dedicada
gcloud iam service-accounts create minha-func-sa --display-name="SA Cloud Function"

# Conceder role mínimo num recurso específico (least privilege)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:minha-func-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

# Deploy de função usando a SA dedicada (sem chave)
gcloud functions deploy minha-func \
  --service-account=minha-func-sa@PROJECT_ID.iam.gserviceaccount.com

# Tag com Semantic Versioning (nunca latest)
docker tag minha-imagem REGISTRY/minha-imagem:1.2.0

# Emulador local (ex.: Firestore)
gcloud emulators firestore start
```

## Pegadinhas de prova
- "Função precisa de mínimo acesso" → criar **service account custom com least privilege**, NÃO usar a App Engine default SA.
- "Como autenticar workload sem expor segredo" → **anexar service account ao recurso e evitar service account keys**; chave JSON é último recurso.
- "Reduzir tempo de build do Docker" → **copiar dependências antes do código** (layer caching), não `COPY . .` de cara.
- "Imagem grande / cold start lento" → **base image leve (alpine/distroless/scratch)**, remover o desnecessário.
- "Garantir versão estável e reprodutível" → **Semantic Versioning + tag explícita**, NUNCA `latest`.
- "Dev/teste sem provisionar recurso pago" → **Cloud Emulators** (Bigtable, Datastore, Firestore, Pub/Sub, Spanner).
- "Build de imagem Java sem Dockerfile" → **Jib**. "Loop contínuo de dev em containers" → **Skaffold**.
- Mover linhas que mudam pouco para o **topo** do Dockerfile (não embaixo) para maximizar reaproveitamento de camadas.

## Fontes
- https://cloud.google.com/blog/products/containers-kubernetes/7-best-practices-for-building-containers
- https://docs.cloud.google.com/iam/docs/best-practices-service-accounts
- https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys
- https://cloud.google.com/blog/products/application-development/least-privilege-for-cloud-functions-using-cloud-iam
