# Direct VPC egress (Cloud Run → VPC)

## O que é
- Conecta Cloud Run (serviço/job) à VPC **sem connector / sem proxy**.
- A instância recebe um IP **direto de uma subnet sua** e fala com recursos de IP privado (Cloud SQL interno, Memorystore, GCE, etc.).
- Equivalente AWS: **Lambda em VPC** (ENI na sua subnet). Connector ≈ proxy/NAT no meio do caminho.
- Forma **recomendada** pelo Google (GA); connector = legado.

## Quando usar
- **Direct VPC egress (default):** menor custo, maior throughput, escala a zero. Use na dúvida.
- **Serverless VPC Access connector:** quando precisar de **IP de saída fixo** sem montar Cloud NAT, ou **cold start / autoscaling a partir do zero** mais rápido.

## Pontos-chave
Direct egress vs Connector:

| | Direct VPC egress | VPC Access connector |
|---|---|---|
| Infra | nenhuma (sem proxy) | grupo de VMs gerenciadas |
| Custo | só egress de rede (escala a zero) | egress **+ compute das VMs** |
| Throughput | ~**1 Gbps/instância** (~2x) | menor (hop extra) |
| IPs | usa mais IPs da subnet | usa menos IPs |
| Firewall | **manual** | criado automaticamente |
| Network tags | por revisão (granular) | no nível do connector |
| Autoscaling/cold start | mais lento (cria NIC) | mais rápido |

## Comando/CLI (referência)
```bash
gcloud run deploy SERVICE \
  --image=IMAGE_URL \
  --network=NETWORK \
  --subnet=SUBNET \
  --network-tags=TAGS \
  --vpc-egress=all-traffic \   # ou private-ranges-only
  --region=REGION
```
- `--vpc-egress`: `private-ranges-only` (só RFC1918) vs `all-traffic` (tudo pela VPC).

## Pegadinhas de prova
- **Subnet mínima `/26`** (64 IPs). Direct egress consome ~2x instâncias + buffer; menor que isso falha.
- **Firewall NÃO é criado automaticamente** — configure na mão ou o tráfego é bloqueado.
- **IPs são efêmeros** → nunca faça allowlist por IP individual. Em firewall, libere o **range da subnet inteira**.
- Precisa de **IP de saída fixo** → use **Cloud NAT** na frente (ou connector). Direct egress sozinho não dá IP fixo.
- "Cloud Run alcançar recurso de IP privado" → resposta moderna/default = **Direct VPC egress**.

## Fontes
- https://docs.cloud.google.com/run/docs/configuring/connecting-vpc
- https://docs.cloud.google.com/run/docs/configuring/vpc-direct-vpc
- https://cloud.google.com/blog/products/serverless/direct-vpc-egress-for-cloud-run-is-now-ga
