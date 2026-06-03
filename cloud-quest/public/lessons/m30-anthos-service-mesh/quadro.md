# 30 — Anthos / Cloud Service Mesh

## O que é

- **Anthos** (renomeado **GKE Enterprise** em 2023): plataforma para gerenciar clusters Kubernetes **multi-cloud e híbridos** (GCP, AWS, Azure, on-prem) de forma consistente.
  - **Anthos Config Management** = GitOps: config dos clusters num repo Git → commit → aplica automático.
  - **Fleet** (frota): agrupamento lógico de clusters para aplicar policies juntas.
  - AWS ≈ **EKS Anywhere** + gestão centralizada de frota.
- **Cloud Service Mesh** (ex-**Anthos Service Mesh** + ex-**Traffic Director**): malha de serviço gerenciada, **baseada em Istio**.
  - **Data plane**: proxy **Envoy** rodando como **sidecar** ao lado de cada pod, intercepta todo o tráfego.
  - **Control plane**: injeta sidecars, distribui certificados, configura roteamento/descoberta.
  - AWS ≈ **AWS App Mesh** (também Envoy).

```
        Pod A                         Pod B
 ┌────────────────┐           ┌────────────────┐
 │ app  │ Envoy   │◄──mTLS───►│ Envoy  │ app   │   ← data plane (sidecars)
 └────────────────┘           └────────────────┘
          ▲                            ▲
          └────────── Control Plane ───┘            ← injeta proxy + config + CA
```

## Quando usar

- Tem clusters K8s em **várias nuvens / on-prem** e precisa de gestão e policies consistentes → **Anthos / GKE Enterprise**.
- Tem **muitos microservices** e precisa de **mTLS, observabilidade e controle de tráfego** sem mexer no código → **Cloud Service Mesh**.
- Precisa de **canary / A/B / traffic splitting** por porcentagem entre versões.
- Quer **fault injection** (atrasos/erros) para testar resiliência (Chaos Monkey).
- Quer **mTLS automático** entre serviços com CA gerenciada.

## Pontos-chave

- Sidecar = proxy **Envoy**; mesh open source = **Istio**; Cloud Service Mesh = Istio gerenciado pela Google.
- **Sem mudar código**: mTLS, retries, timeouts, roteamento, métricas — tudo no proxy.
- **Segurança**: mTLS automático + managed private CA; auth de usuários via **IAP**.
- **Observabilidade**: integra com Cloud Logging, Monitoring, Trace; **monitoramento de SLO**.
- **Tráfego**: canary, A/B, traffic split %, mirroring/shadow, fault injection.
- Config feita via **APIs do Istio** (VirtualService, DestinationRule, etc.).

## Comando/CLI (referência)

```bash
# Provisionar Cloud Service Mesh gerenciado num cluster GKE (fleet)
gcloud container fleet mesh enable --project PROJECT_ID
gcloud container clusters update CLUSTER --fleet-project PROJECT_ID
gcloud container fleet mesh update \
  --management automatic --memberships CLUSTER --project PROJECT_ID

# Habilitar injeção automática de sidecar no namespace
kubectl label namespace NAMESPACE istio.io/rev=asm-managed --overwrite

# Traffic split / canary (Istio) — aplicar manifesto
kubectl apply -f virtual-service.yaml   # ex.: 90% v1 / 10% v2
```

## Pegadinhas de prova

- **REBRANDING (mais importante)**: *Anthos Service Mesh* = *Cloud Service Mesh* = *Istio gerenciado*. *Anthos* = *GKE Enterprise*. São sinônimos na prova.
- **Cloud Service Mesh unificou** Anthos Service Mesh **+ Traffic Director** num só produto.
- Sidecar é **Envoy**, não Istio. Istio é o framework/control plane; Envoy é o proxy do data plane.
- **Istio on GKE** (legado/beta) ≠ recomendado para produção; o recomendado é **Cloud/Anthos Service Mesh** (com suporte e SLA Google).
- mTLS, observabilidade e canary saem **sem alterar o código** da aplicação.
- Anthos = **gestão de clusters multi-cloud**; Service Mesh = **comunicação entre serviços**. Não confundir os dois.
- Config de tráfego usa **APIs do Istio**, mesmo no produto gerenciado.

## Fontes

- https://cloud.google.com/blog/products/networking/introducing-cloud-service-mesh
- https://docs.cloud.google.com/service-mesh/docs/overview
- https://docs.cloud.google.com/service-mesh/docs/migrate-istio-to-anthos-service-mesh
- https://timberry.dev/introducing-gke-enterprise
