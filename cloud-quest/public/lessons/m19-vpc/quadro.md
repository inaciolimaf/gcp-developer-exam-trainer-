# 19 — VPC (Redes Privadas)

## O que é
Virtual Private Cloud: a rede privada e isolada onde voce coloca seus recursos no GCP. Equivalente a **Amazon VPC**, com uma diferenca central: no GCP a **VPC é GLOBAL** (abrange todas as regioes), enquanto na AWS é regional.

- **VPC** = recurso **global** (inclui rotas e firewall rules).
- **Subnet** = recurso **regional** (define o bloco CIDR / range de IPs). Na AWS a subnet é zonal.
- Recursos de qualquer regiao podem viver na mesma VPC.
- Padrao: subnet publica (load balancer) + subnet privada (VM/DB).

## Quando usar
- **Sempre** crie recursos do GCP dentro de uma VPC (isolamento + comunicacao interna segura).
- **Subnets separadas** pra publico vs privado, ou pra distribuir em varias regioes (HA).
- **VPC Peering**: conectar duas VPCs (mesmo projeto, projetos ou orgs diferentes) via IP interno.
- **Shared VPC**: compartilhar uma rede entre varios projetos da mesma organizacao.
- **Private Google Access**: VM sem IP externo precisa falar com APIs do Google.

## Pontos-chave
- **Firewall rules**: stateful (resposta volta automatica), prioridade 0–65535 (0 = mais alta), vivem na VPC e sao **globais**.
- Regras **implicitas** (nao deletaveis): **deny all ingress** + **allow all egress**.
- VPC default tem 4 regras extras (prio 65534): allow-internal, allow-ssh (22), allow-rdp (3389), allow-icmp.
- **Rotas de sistema** conectam todas as subnets da VPC automaticamente.
- **Peering NAO é transitivo**: A↔B e B↔C nao da A↔C; admins nao herdam permissao na VPC par.
- **Shared VPC**: criada na org/pasta; **host project** (guarda a rede) + **service projects** (consomem). Requer papel **Shared VPC Admin**.
- **Private Google Access**: acesso a servicos Google sem IP externo e sem passar pela Internet publica.

## Comando/CLI (referência)
```bash
# Criar VPC em modo custom (sem subnets automaticas)
gcloud compute networks create minha-vpc --subnet-mode=custom

# Criar subnet regional com CIDR
gcloud compute networks subnets create sub-priv \
  --network=minha-vpc --region=us-central1 --range=10.0.0.0/24

# Habilitar Private Google Access na subnet
gcloud compute networks subnets update sub-priv \
  --region=us-central1 --enable-private-ip-google-access

# Firewall rule (ingress allow)
gcloud compute firewall-rules create allow-ssh \
  --network=minha-vpc --allow=tcp:22 --priority=1000

# VPC Peering (criar nos dois lados)
gcloud compute networks peerings create peer-a-b \
  --network=vpc-a --peer-network=vpc-b
```

## Pegadinhas de prova
- **VPC é GLOBAL, subnet é REGIONAL.** Diferente da AWS (VPC regional, subnet zonal).
- Ingress é **negado por padrao**; egress é **permitido por padrao** (regras implicitas, indeletaveis).
- **Peering nao é transitivo** — precisa de peering explicito entre cada par.
- Firewall é por **VPC/rede**, nao por subnet; prioridade **menor número = maior prioridade**.
- VM privada que precisa de API Google sem IP externo = **Private Google Access**.
- Shared VPC = **um** host project + varios service projects, no nivel de **organizacao/pasta**.

## Fontes
- https://cloud.google.com/vpc/docs/vpc
- https://cloud.google.com/vpc/docs/vpc-peering
- https://cloud.google.com/firewall/docs/firewalls
- https://cloud.google.com/vpc/docs/private-google-access
