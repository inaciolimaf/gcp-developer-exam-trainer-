# 32 — Release Management (Estratégias de Deploy)

## O que é
Release Management é o conjunto de estratégias para colocar uma nova versão (v2) em produção controlando **downtime, custo, risco e velocidade de rollback**. Âncora AWS: equivale ao que o **CodeDeploy** faz com in-place / blue-green / canary — mesmas ideias, nomes diferentes no GCP.

Estratégias clássicas:
- **Recreate** — mata v1, sobe v2 nas mesmas instâncias. Tem downtime.
- **Rolling update** — atualiza em lotes (window size); zero downtime. Variante *rolling with additional batch* cria instâncias v2 extras antes de derrubar v1 (mantém capacidade).
- **Blue/Green** — ambiente paralelo v2; switch instantâneo de 100% do tráfego; rollback fácil. *Shadow testing* = espelha tráfego real pra v2 sem responder ao usuário.
- **Canary** — v2 num subconjunto, fatia do tráfego real; promove se passar. *A/B testing* = mesma mecânica, foco em negócio (usuário gosta da feature?).

## Quando usar
- **Recreate**: dev/test, app tolera downtime, sem necessidade de backward compatibility, prioriza custo e simplicidade.
- **Rolling**: produção padrão, zero downtime sem infra extra, tolera release lenta. Default no GKE Deployment.
- **Rolling + additional batch**: rolling mas sem perder capacidade de atendimento durante a release.
- **Blue/Green**: precisa de rollback instantâneo e zero downtime, e pode pagar o dobro de infra temporariamente.
- **Canary / A-B**: quer limitar blast radius validando v2 com tráfego real antes do rollout total.
- **Cloud Run**: revisions + traffic split para canary/gradual/blue-green/rollback nativos.
- **App Engine**: múltiplas versions + `set-traffic --splits` / `--migrate`.
- **GKE**: RollingUpdate/Recreate nativos; canary/blue-green finos via service mesh (Istio/Anthos).

## Pontos-chave
| Estratégia | Downtime | Infra extra | Velocidade rollback | Backward compat (v1+v2 juntas)? |
|---|---|---|---|---|
| **Recreate** | Sim (app cai) | Nenhuma | Lento (novo recreate, downtime) | Não (1 versão por vez) |
| **Rolling update** | Não | Nenhuma | Médio (rolling de volta) | Sim |
| **Blue/Green** | Não | Dobra (ambiente paralelo) | Instantâneo (vira pro blue) | Sim (v2 fica ativa) |
| **Canary** | Não | Nenhuma/pouca | Rápido (corta fatia) | Sim |

- Sempre que **duas versões ficam ativas** (rolling, canary, blue/green), banco e serviços precisam ser **backward compatible** com v1 e v2.
- **Cloud Run revision** é imutável; cada deploy gera uma nova; traffic split é first-class.
- **GKE**: `maxSurge` = pods a mais permitidos; `maxUnavailable` = pods que podem ficar fora durante o rollout.
- **App Engine split-by**: `IP` (sticky por hash de IP) ou `COOKIE` (`GOOGAPPUID`, mais preciso).

## Comando/CLI (referência)
```
# Cloud Run — canary / gradual / blue-green / rollback
gcloud run deploy SERVICE --image IMG --no-traffic --tag green
gcloud run services update-traffic SERVICE --to-tags green=5      # canary 5%
gcloud run services update-traffic SERVICE --to-latest            # blue/green: 100%
gcloud run services update-traffic SERVICE --to-revisions REV=100 # rollback

# App Engine
gcloud app deploy --no-promote                                    # sobe sem tráfego
gcloud app services set-traffic S --splits v2=1                   # 100% v2
gcloud app services set-traffic S --splits v1=.5,v2=.5 --split-by cookie
gcloud app services set-traffic S --splits v2=1 --migrate         # migração gradual

# GKE (Deployment): strategy.type = RollingUpdate | Recreate
kubectl rollout undo deployment/NAME                              # rollback
```

## Pegadinhas de prova
- **Zero downtime + rollback instantâneo + pode pagar infra dobrada** → **Blue/Green**.
- **Validar v2 com fração de usuários reais antes do rollout total** → **Canary**. Se o foco é "usuários gostam da feature?" → **A/B testing**.
- **Menor custo / mais simples e downtime é aceitável** → **Recreate**.
- **Zero downtime sem infra extra, release pode ser lenta** → **Rolling update**.
- **Testar com tráfego de produção real sem afetar o usuário** → **Shadow testing** (cuidado com efeitos colaterais, ex.: pagamento → use stub).
- Cloud Run: deploy não muda tráfego se a revision anterior estava pinada; use `--to-latest` para 100% na nova.
- `gcloud app deploy --no-promote` (App Engine) ≈ `--no-traffic` (Cloud Run): sobe a versão **sem** receber tráfego.
- GKE não tem canary/blue-green nativos "de fábrica" no Deployment — precisa de Service/Ingress duplo ou **service mesh (Istio/Anthos Service Mesh)**; Spinnaker/Cloud Build para automação.

## Fontes
- Cloud Run — Rollbacks, gradual rollouts, and traffic migration: https://docs.cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration
- App Engine — Splitting traffic: https://docs.cloud.google.com/appengine/docs/standard/splitting-traffic
- Google Cloud Blog — Cloud Run gradual rollouts and rollbacks: https://cloud.google.com/blog/products/serverless/cloud-run-now-supports-gradual-rollouts-and-rollbacks
