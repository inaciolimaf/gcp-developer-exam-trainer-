# 08 — App Engine

## O que é

Plataforma como serviço (PaaS) totalmente gerenciada: voce entrega o codigo, o Google cuida de provisionamento, deploy, load balancing e scaling.

Equivalente AWS: **App Engine ≈ AWS Elastic Beanstalk** (com scale-to-zero no Standard, que o Beanstalk classico nao tem).

Dois environments:

| | Standard | Flexible |
|---|---|---|
| Runtime | Sandbox da linguagem (Java, Python, PHP, Node.js, Ruby, Go) | Container Docker em VM do Compute Engine (qualquer runtime) |
| Scale-to-zero | Sim | Nao (minimo 1 instancia) |
| Startup | Segundos | Minutos |
| Scaling | automatic, basic, manual | automatic, manual (sem basic) |
| Request timeout | 10 min (automatic) / ate 24h (basic/manual) | 60 min |
| Billing | instance hours | vCPU + memoria + disco persistente |
| SSH / disco local | Nao / so /tmp | Sim / disco efemero anexavel |

Hierarquia: **app → service → version → instance**. 1 app por projeto, preso a 1 regiao (imutavel).

## Quando usar

- Microservices simples / apps web sem precisar de orquestracao Kubernetes.
- **Standard**: runtime suportado, cargas intermitentes (scale-to-zero corta custo), startup rapido.
- **Flexible**: runtime customizado (C, C++, .NET), precisa de SSH/background process, request ate 60 min.
- Precisa de orquestracao avancada de containers: use GKE, nao App Engine.

## Pontos-chave

- 1 projeto = 1 app; regiao do app NAO muda depois de criado.
- Traffic splitting entre versions (canary/blue-green): split por **IP**, **cookie** ou **random**.
- IP split = mesmo cliente sempre na mesma version (ruim para testar do proprio IP).
- `--no-promote` faz deploy sem mover trafego para a nova version.
- Scaling configurado no **app.yaml**.
- Instancias **residentes** (fixas, sempre on) vs **dinamicas** (sobem/descem com carga).

## Comando/CLI (referência)

```bash
# Deploy (promove por padrao)
gcloud app deploy --version=v3

# Deploy SEM mover trafego
gcloud app deploy --version=v3 --no-promote

# Abrir uma version especifica para teste
gcloud app browse --version=v3

# Traffic splitting
gcloud app services set-traffic default --splits=v2=.5,v3=.5 --split-by=random
gcloud app services set-traffic default --splits=v3=1   # 100% para v3
```

```yaml
# app.yaml
runtime: python39
service: my-service
env_variables:
  KEY: value

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10
  max_concurrent_requests: 50
# ou: basic_scaling: { max_instances, idle_timeout }
# ou: manual_scaling: { instances }
# Flexible: env: flex
```

## Pegadinhas de prova

- **Basic scaling NAO existe no Flexible** (so Standard tem os 3).
- **Scale-to-zero so no Standard**; Flexible tem sempre >= 1 instancia.
- Standard automatic scaling: timeout **10 min**; basic/manual chega a **24h**; Flexible **60 min**.
- Regiao do App Engine e **imutavel** — escolha errada exige novo projeto.
- Standard Python/PHP da geracao V1 tem rede restrita; V2 e Go/Java V1 nao tem essa restricao.
- Disco no Flexible e **efemero** — nao use como storage permanente.
- Scaling se configura no **app.yaml**, nao via flag de deploy.

## Fontes

- https://docs.cloud.google.com/appengine/docs/the-appengine-environments
- https://docs.cloud.google.com/appengine/docs/standard/how-instances-are-managed
- https://cloud.google.com/appengine/docs/flexible/flexible-for-standard-users
