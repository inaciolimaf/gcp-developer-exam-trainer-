# 09 — Google Kubernetes Engine (GKE)

## O que é
- **GKE** = Kubernetes gerenciado da Google Cloud. Ancora AWS: **GKE ≈ Amazon EKS**.
- **Cluster** = onde rodam as workloads. Composto por:
  - **Control plane** (no mestre): API server, scheduler, etcd — **sempre gerenciado pelo Google** (nos dois modos).
  - **Worker nodes**: VMs do Compute Engine (Container-Optimized OS) onde os Pods executam, organizados em **node pools**.
- **Objetos K8s** (iguais em qualquer nuvem):
  - **Pod**: menor unidade implantavel; 1+ containers; IP efemero (muda se recriado).
  - **Deployment**: representa um microservico e suas versoes; gerencia **ReplicaSet**; rollout com zero downtime. Cada instancia = um Pod.
  - **Service**: endpoint estavel + load balancing pra um conjunto de Pods; resolve o IP efemero. Discovery via **DNS** e **Namespaces**.

## Quando usar
- **Autopilot** → menos operacao, paga por **recurso pedido pelos Pods** (CPU/mem), sem gerenciar nodes. Sempre **regional**. Escolha padrao pra produção.
- **Standard** → controle fino: node pools customizados, GPU, tipos de VM, zonal ou regional. Paga por **VM** (ocupada ou não).
- **GKE vs Cloud Run** → GKE quando precisa do ecossistema K8s completo; Cloud Run pra container stateless simples sem cluster.

## Pontos-chave
- Control plane gerenciado nos **dois** modos; a diferenca esta no **data plane** (nodes).
- **Autopilot**: Google gerencia nodes (sizing, scaling, upgrade, repair); **sem node pools**; auto-repair e auto-upgrade pre-ligados; regional por padrao.
- **Standard**: voce gerencia node pools; auto-repair/auto-upgrade e cluster autoscaler são **opcionais**.
- **Autoscaling em 2 camadas**:
  - **HPA (Horizontal Pod Autoscaler)** → escala numero de **Pods** por carga (ex.: CPU).
  - **Cluster Autoscaler** → adiciona/remove **nodes** no node pool.
  - Escalonamento total = **HPA + Cluster Autoscaler** juntos.
- Custo (Standard): **Spot/preemptive VMs**, tipos **E2** (mais baratos que N1), **committed use discounts** pra carga continua.
- **GPU** → node pool dedicado com GPU; agenda as workloads que precisam nele.

## Comando/CLI (referência)
```bash
# criar cluster Autopilot
gcloud container clusters create-auto meu-cluster --region=us-central1

# criar cluster Standard
gcloud container clusters create meu-cluster --zone=us-central1-a --num-nodes=3

# conectar kubectl
gcloud container clusters get-credentials meu-cluster --region=us-central1

# objetos
kubectl get pods -o wide
kubectl get deployments
kubectl create deployment hello --image=IMAGE
kubectl expose deployment hello --type=LoadBalancer --port=80

# rollout (nova versao, zero downtime)
kubectl set image deployment/hello hello=IMAGE:v2

# autoscaling de Pods (HPA)
kubectl autoscale deployment hello --min=2 --max=10 --cpu-percent=70

# redimensionar node pool (Standard)
gcloud container clusters resize meu-cluster --num-nodes=5 --region=us-central1
```

## Pegadinhas de prova
- "Control plane gerenciado" vale pra **Autopilot E Standard** — não é exclusivo do Autopilot.
- **HPA escala Pods, Cluster Autoscaler escala nodes** — não confunda; total automation precisa dos dois.
- Em **Autopilot você NÃO cria node pools** nem escolhe VM — só declara resource requests dos Pods.
- Cobrança: **Autopilot por Pod request**; **Standard por VM** (mesmo ocioso).
- IP do Pod e **efemero**; pra endpoint estavel use **Service** (não dependa do IP do Pod).
- Autopilot e **sempre regional**; zonal só existe no Standard.
- Reduzir custo no GKE = Spot VMs + E2 + CUDs + região certa (não "trocar pra Autopilot" automaticamente).

## Fontes
- https://docs.cloud.google.com/kubernetes-engine/docs/resources/autopilot-standard-feature-comparison
- https://docs.cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview
- https://docs.cloud.google.com/kubernetes-engine/docs/concepts/types-of-clusters
