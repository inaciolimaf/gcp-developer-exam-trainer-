# 17 — DevOps & SRE (Cloud Build, Artifact Registry)

## O que é

**DevOps**: automatizar tudo entre o commit e a produção pra ter feedback rápido.
- **CI** (Continuous Integration): a cada commit, roda testes + empacota (JAR/WAR/imagem Docker).
- **Continuous Delivery**: além do CI, deixa a build sempre pronta pra produção, mas o deploy final passa por um **gate de aprovação manual**.
- **Continuous Deployment**: vai além — deploy automático até a **produção**, sem aprovação manual.

**Cloud Build**: serviço gerenciado de CI/CD. Pega o código-fonte e gera artefatos. Config em `cloudbuild.yaml` (lista de `steps`, cada step = um container). ≈ AWS **CodeBuild + CodePipeline**.

**Artifact Registry**: repositório de artefatos (Docker, Maven, npm, Python, Go, Apt, RPM, Helm). URL `*.pkg.dev`. Sucessor do **Container Registry** (`gcr.io`, deprecated). ≈ AWS **ECR + CodeArtifact**.

**SRE** = "DevOps++" do Google. Uma equipe cuida de disponibilidade, latência, monitoramento, capacity planning, gerenciada por SLOs.

## Quando usar

- **Cloud Build** → pipeline gerenciado de CI/CD nativo do GCP (alternativa open-source: Jenkins; deploy multi-cloud: Spinnaker).
- **Artifact Registry** → armazenar imagens Docker e pacotes privados. **Sempre prefira o Artifact Registry** (Container Registry está deprecated/desligado).
- **Container Registry** (`gcr.io`) → legado; só imagens; usa GCS buckets; só aparece pra contraste.
- **SLI/SLO/SLA** → definir e medir confiabilidade; **error budget** controla ritmo de releases.

## Pontos-chave

- `cloudbuild.yaml`: `steps` rodam em sequência, cada um num container builder isolado.
- **Triggers**: disparam build automático em push pra branch/tag (liga git ao pipeline).
- **Substitutions**: variáveis resolvidas em build-time.
  - Built-in: `$PROJECT_ID`, `$BUILD_ID`, `$COMMIT_SHA`, `$BRANCH_NAME`, `$TAG_NAME`.
  - Customizadas pelo usuário: começam com `_` (ex.: `_REGION`).
- **Artifact Registry**: repositórios separados, regional ou multi-region, criptografia automática (Google-managed ou CMEK). Roles: **reader / writer / admin** + permissões por repositório.
- **Artifact Analysis**: vulnerability scanning automático no push (OS **e** pacotes de linguagem), com updates contínuos de CVEs.
- **SLI** = medida bruta (disponibilidade, latência, throughput, durabilidade). **SLO** = SLI + meta (interno). **SLA** = contrato externo com penalidade.
- **Regra**: SLO mais rígido que SLA.
- **Error budget** = 1 − SLO. Tem budget → releases rápidas; estourou → desacelera.
- **Toil** = trabalho manual repetitivo → minimizar/automatizar.
- Práticas SRE: load shedding, circuit breaker (evita cascading failures), chaos/resilience testing (Simian Army), load testing, DRT.

## Comando/CLI (referência)

```bash
# Submeter um build (usa cloudbuild.yaml do diretório)
gcloud builds submit --config cloudbuild.yaml .

# Passar substitution customizada
gcloud builds submit --substitutions=_REGION=us-central1 .

# Criar repositório Docker no Artifact Registry
gcloud artifacts repositories create meu-repo \
  --repository-format=docker --location=us-central1

# Push de imagem (URL pkg.dev)
docker push us-central1-docker.pkg.dev/PROJECT_ID/meu-repo/app:tag

# Listar vulnerabilidades escaneadas
gcloud artifacts docker images list --show-occurrences
```

## Pegadinhas de prova

- **`gcr.io` = Container Registry (legado/deprecated); `pkg.dev` = Artifact Registry (recomendado).**
- Container Registry: **só imagens** + usa **GCS buckets** (permissão via IAM do bucket). Artifact Registry: **vários formatos** + repositórios próprios + roles próprias.
- Scan no Container Registry só pega **pacotes de OS**; Artifact Analysis (Artifact Registry) pega **OS + linguagem**.
- **SLA é externo (com penalidade); SLO é interno.** SLI é só a medida, sem meta.
- **Error budget vem do SLO, não do SLA.**
- **Continuous Deployment** = automático até a produção (sem gate); **Continuous Delivery** = pronto pra produção, mas com aprovação manual antes do deploy final. Não inverta.
- Substitutions do usuário **começam com `_`**; as built-in não.
- **Cloud Source Repositories** = git privado gerenciado do GCP (≈ CodeCommit); **Spinnaker** = entrega multi-cloud; **Jenkins** = CI open-source.

## Fontes

- Cloud Build — build config schema: https://docs.cloud.google.com/build/docs/build-config-file-schema
- Cloud Build — substitutions: https://docs.cloud.google.com/build/docs/configuring-builds/substitute-variable-values
- Artifact Registry — Artifact Analysis e scanning: https://docs.cloud.google.com/artifact-registry/docs/analysis
- Transição do Container Registry para Artifact Registry: https://docs.cloud.google.com/artifact-registry/docs/transition/setup-gcr-repo
