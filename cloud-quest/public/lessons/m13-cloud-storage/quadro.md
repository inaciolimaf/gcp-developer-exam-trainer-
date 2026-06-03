# 13 — Cloud Storage (Object Storage)

## O que é
- Object storage gerenciado e escalavel do Google Cloud. Equivalente AWS: **Amazon S3**.
- Modelo: **buckets** contem **objects** (pares key-value).
- Bucket name: **globalmente unico**, 3-63 chars, minusculas/numeros/`-`/`_`/`.`, nao pode conter `goog`/`google`. Entra na URL do object.
- Object: **key** unica no bucket; tamanho maximo **5 TB**; objects ilimitados por bucket.
- Durabilidade: **eleven nines (99,999999999%)** anual em todas as classes; baixa latencia em todas (≠ Glacier).

## Quando usar
- Arquivos de midia, backups, logs, data lake, assets estaticos, staging on-prem → nuvem.
- **Standard** — dados quentes / curta duracao. Sem minimo.
- **Nearline** — acesso ~1x/mes. Minimo **30 dias**.
- **Coldline** — acesso ~1x/trimestre. Minimo **90 dias**.
- **Archive** — acesso < 1x/ano. Minimo **365 dias**.
- Storage class default no bucket, mas pode ser definida **por object**.

## Pontos-chave
- **Lifecycle management**: condicoes (age, createdBefore, isLive, matchesStorageClass, numNewerVersions) → acoes `SetStorageClass` ou `Delete`.
  - Transicoes so descem: Standard → Nearline/Coldline/Archive; Nearline → Coldline/Archive; Coldline → Archive.
- **Versioning**: ativado no bucket; versao **live** vs **noncurrent**; identificada por `key + generation number`. Deletar live → vira noncurrent; deletar noncurrent → some de vez.
- **IAM vs ACL**: dois sistemas em paralelo (qualquer um que conceda → acesso). IAM = recomendado, nivel bucket. ACL = legado, por object, herdado pra interop com S3.
- **Uniform bucket-level access**: desliga ACLs, so IAM. Apos 90 dias ativo, nao pode desativar.
- **Signed URLs**: acesso temporario read/write sem conta Google. Equivalente AWS: **S3 presigned URLs**.
- **Location types**: `region` | `dual-region` | `multi-region`.

## Comando/CLI (referência)
```bash
# Cloud Storage usa gsutil (NAO gcloud) — gcloud storage tambem existe
gcloud config set project MY_PROJECT

gsutil mb gs://my-bucket-name              # make bucket
gsutil ls gs://my-bucket-name              # lista objects live
gsutil ls -a gs://my-bucket-name           # inclui versoes noncurrent
gsutil cp arquivo.txt gs://my-bucket/      # upload / copy
gsutil mv gs://b1/obj gs://b2/obj          # move/rename
gsutil rewrite -s nearline gs://b/obj      # muda storage class do object

# lifecycle e versioning
gsutil lifecycle set rules.json gs://my-bucket
gsutil versioning set on gs://my-bucket

# signed URL (10 min)
gsutil signurl -d 10m KEY.json gs://my-bucket/obj
```

## Pegadinhas de prova
- **gsutil**, nao gcloud, no fluxo classico (gcloud storage e a alternativa nova).
- Todas as classes tem **mesma durabilidade e mesma latencia baixa**; muda custo de storage, retrieval e **minimum storage duration**.
- Apagar antes do minimo (30/90/365 dias) gera **early deletion fee**.
- Bucket name e **global**, nao por projeto/regiao.
- Lifecycle so transiciona **pra classes mais frias**, nunca aquece.
- Uniform bucket-level access vira **irreversivel apos 90 dias**.
- Signed URL = acesso **sem precisar de conta Google**; nao confundir com IAM (que precisa de identidade).
- Object maximo **5 TB**; quantidade de objects ilimitada.
- Versioning aumenta custo — combine com lifecycle (`numNewerVersions` / `daysSinceNoncurrentTime`) pra limpar.

## Fontes
- https://docs.cloud.google.com/storage/docs/storage-classes
- https://docs.cloud.google.com/storage/docs/access-control
- https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access
- https://docs.cloud.google.com/storage/docs/access-control/signed-urls
