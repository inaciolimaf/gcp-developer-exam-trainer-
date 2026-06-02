# Cloud Storage: Soft Delete e Locked Retention Policies (imutabilidade/compliance)

## O que é
- **Soft delete**: "lixeira" automática do bucket. Objeto deletado/sobrescrito vira `soft-deleted` e é recuperável por um período. Ligado por padrão.
- **Object versioning** ≈ **S3 Versioning**: guarda versões anteriores (noncurrent) a cada overwrite/delete; você controla a limpeza (lifecycle).
- **Retention policy + bucket lock** ≈ **S3 Object Lock (compliance mode)**: período mínimo de retenção; quando *locked*, vira WORM imutável.
- **Object retention lock**: retenção por-objeto (em vez de política única do bucket inteiro).

## Quando usar
- **Soft delete**: proteção contra deleção acidental/maliciosa, sem configurar nada. Recovery de curto prazo.
- **Versioning**: histórico de versões, rollback, auditoria de mudanças.
- **Locked retention**: compliance regulatório (FINRA, SEC, CFTC, saúde) — provar imutabilidade.

## Pontos-chave
- Soft delete: **default ON**; retenção default **7 dias**; range **7 a 90 dias**; **0 = desligado**.
- Soft-deleted: não pode ser lido/modificado, só **listado** e **restaurado**; **gera custo** até expirar.
- Retention policy: delete/overwrite antes da idade mínima → erro **403 `retentionPolicyNotMet`**; aplica retroativo.
- **Lock é irreversível**: não remove, não encurta, não desfaz o lock; **só aumenta** a duração.
- Bucket com retention não pode ser deletado até todos os objetos cumprirem o período.
- Os três coexistem no mesmo bucket; apagar noncurrent version → ela vira soft-deleted.

## Comando/CLI (referência)
```
# Soft delete (configurar / desligar)
gcloud storage buckets update gs://BUCKET --soft-delete-duration=30d
gcloud storage buckets update gs://BUCKET --soft-delete-duration=0

# Restaurar
gcloud storage restore gs://BUCKET/OBJECT#GENERATION

# Versioning
gcloud storage buckets update gs://BUCKET --versioning

# Retention policy + lock (IRREVERSÍVEL)
gcloud storage buckets update gs://BUCKET --retention-period=1y
gcloud storage buckets update gs://BUCKET --lock-retention-period
```

## Pegadinhas de prova
- "Não pode reduzir nem remover" / "regulatório" / "WORM" → **locked retention policy** (não versioning, não soft delete).
- "Recuperar objeto deletado por engano sem ter configurado nada" → **soft delete** (default ON, 7 dias).
- "Manter versões anteriores de um objeto" → **object versioning** (= S3 Versioning).
- Lock só permite **aumentar** a duração; encurtar/remover é impossível — decisão sem volta.
- Soft delete **não** impede deleção; ele guarda o que foi deletado. Quem *impede* deletar é a retention policy.
- Soft-deleted objects **custam** dinheiro; para dados temporários, use bucket separado com soft delete OFF.
- Soft delete max = **90 dias**, não infinito.

## Fontes
- https://docs.cloud.google.com/storage/docs/soft-delete
- https://docs.cloud.google.com/storage/docs/bucket-lock
- https://docs.cloud.google.com/storage/docs/object-versioning
- https://docs.cloud.google.com/storage/docs/using-bucket-lock
