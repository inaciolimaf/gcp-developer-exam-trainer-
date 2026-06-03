# 10 — GKE: Configuração YAML (Deployment, Service, Labels)

## O que é
Configuração **declarativa** do Kubernetes: você descreve o **estado desejado** em arquivos YAML e aplica com `kubectl apply`. No GKE o YAML é idêntico ao do EKS/qualquer cluster — só o control plane é gerenciado pelo Google.

Os 4 blocos de TODO manifest:

```yaml
apiVersion: apps/v1      # qual API
kind: Deployment         # tipo do recurso
metadata:                # nome, namespace, labels
  name: hello-world
  labels:
    app: hello-world
spec:                    # configuração desejada
  ...
```

Imperativo (`kubectl create/expose/scale`) vs Declarativo (`kubectl apply -f`). Use declarativo: versionável, reproduzível.

## Quando usar
- **Pod**: menor unidade (1+ containers, mesma rede/storage). Raramente criado direto.
- **Deployment**: garante N réplicas + cuida de rolling update. É o que você usa pra apps stateless.
- **Service**: expõe Pods por trás de um IP estável e faz load balancing interno.
- **ConfigMap / Secret**: config não-sensível / credenciais.

| Conceito | AWS / EKS |
|---|---|
| Manifest YAML | mesmo YAML k8s no EKS |
| `apply` declarativo | filosofia do Terraform |
| Service LoadBalancer | ELB/NLB provisionado |
| Secret | Secrets Manager (mas Secret = só base64) |

## Pontos-chave

**Deployment tem DUAS specs** (a que mais confunde):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world
spec:                      # spec do DEPLOYMENT
  replicas: 3
  selector:
    matchLabels:
      app: hello-world     # tem que bater com o template abaixo
  template:                # << definição do POD
    metadata:
      labels:
        app: hello-world   # label do Pod
    spec:                  # spec do POD
      containers:
        - name: hello-world
          image: gcr.io/proj/hello-world:1.0
          ports:
            - containerPort: 8080
```

**Labels + Selectors** = a cola que liga tudo:
- Deployment `selector.matchLabels` → Pods do `template.metadata.labels`
- Service `selector` → Pods com aquele label
- Se não bater: apply falha (Deployment) ou Service fica sem endpoints (sem resposta).

**Service — tipos e portas:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-world
spec:
  type: LoadBalancer   # ClusterIP (default) | NodePort | LoadBalancer
  selector:
    app: hello-world
  ports:
    - port: 80         # porta do Service (externa)
      targetPort: 8080 # porta do container
      # nodePort: 30080  (só em NodePort/LoadBalancer)
```

- **ClusterIP** (default): só interno ao cluster (service-to-service).
- **NodePort**: porta fixa em cada node (`<NodeIP>:<nodePort>`).
- **LoadBalancer**: IP externo via Cloud Load Balancer do GKE.

**ConfigMap / Secret** injetados como env var ou volume. Secret é **base64, não criptografado** por padrão.

**Rolling update** (`spec.strategy`):
- `RollingUpdate` (default): atualiza em lotes, sem downtime.
- `Recreate`: mata todos os Pods, sobe novos → **downtime**.
- `maxSurge` / `maxUnavailable` default = **25%** cada.
- 1 por vez sem perder capacidade: `maxSurge:1, maxUnavailable:0`.
- 1 por vez sem criar Pod extra (custo): `maxSurge:0, maxUnavailable:1`.

## Comando/CLI (referência)
```bash
kubectl apply -f deployment.yaml      # cria/atualiza (declarativo)
kubectl apply -f .                     # aplica todos os YAML da pasta
kubectl get deploy,svc,pods            # ver recursos
kubectl describe deploy hello-world    # detalhes/eventos
kubectl rollout status deploy/hello-world
kubectl rollout undo deploy/hello-world   # rollback
kubectl diff -f deployment.yaml        # ver o que mudaria
kubectl get svc hello-world -o wide    # ver EXTERNAL-IP do LoadBalancer
```

## Pegadinhas de prova
- **Default de Service é `ClusterIP`** (interno). Acesso externo precisa de NodePort ou LoadBalancer.
- **`maxSurge` e `maxUnavailable` default = 25%** (não 1/0).
- **Strategy default é `RollingUpdate`**; `Recreate` causa downtime.
- **Selector ≠ labels do Pod** → Deployment não cria nada / Service sem endpoints.
- **Não confundir `port` (Service) × `targetPort` (container) × `nodePort` (node).**
- **Secret = base64, não é criptografia.** Não trate como cofre seguro por padrão.
- **`apiVersion`**: Deployment = `apps/v1`; Pod/Service/ConfigMap/Secret = `v1`.
- Deployment tem **2 specs aninhadas** (Deployment e Pod template) — saber qual campo vai em qual.

## Fontes
- https://kubernetes.io/docs/concepts/services-networking/service/
- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- https://cloud.google.com/kubernetes-engine/docs/concepts/deployment
- https://cloud.google.com/kubernetes-engine/docs/how-to/exposing-apps
