# 31 — Compute Engine VMs (avancado)

## O que é
Aprofundamento das VMs do Compute Engine (IaaS, equivalente ao EC2 da AWS): tipos de disco, snapshots, metadata server, identidade via service account, OS Login e Shielded VM. Complementa o basico do modulo 04.

## Quando usar
- Workload que precisa de controle de SO/kernel, software legado ou licenca por host.
- Disco rapido descartavel (cache, scratch) -> Local SSD.
- Banco/app sensivel a latencia -> pd-ssd; uso geral -> pd-balanced; bulk sequencial barato -> pd-standard.
- Hardening de boot contra rootkit -> Shielded VM.
- Acesso SSH em escala controlado por IAM -> OS Login.

## Pontos-chave
- **Tipos de Persistent Disk** (block storage de rede, tipo EBS):
  - `pd-standard` (HDD) — barato, sequencial.
  - `pd-balanced` (SSD) — default, custo/performance, latencia sub-ms.
  - `pd-ssd` (SSD) — alto IOPS, baixa latencia, enterprise/DB.
- **Local SSD** — preso ao host, IOPS/latencia muito melhores, mas EFEMERO (some ao parar a VM). Analogo ao EC2 Instance Store.
- **Snapshots** — incrementais e globais (restaura em qualquer regiao).
- **Metadata server** — `metadata.google.internal` (ou `169.254.169.254`); exige header `Metadata-Flavor: Google`; serve project/instance metadata, startup/shutdown scripts e token OAuth da service account. HTTPS so em Shielded VMs.
- **Service account da VM** — default = Compute Engine default SA (papel Editor, amplo demais). Boa pratica: SA dedicada + IAM minimo, em vez de access scopes (legado). Codigo pega credencial pelo metadata server, sem chave no disco. ~ IAM Role do EC2.
- **SSH** — metadata-managed (chaves individuais no metadata) vs OS Login (acesso por IAM, conta Linux automatica). Console = par efemero; `gcloud compute ssh` = par persistente.
- **Shielded VM** — Secure Boot (assinatura do boot), vTPM + Measured Boot (baseline), integrity monitoring (evento no Cloud Logging). vTPM e integrity monitoring ON por padrao; Secure Boot recomendado.

## Comando/CLI (referência)
```bash
# Criar VM com disco balanced, SA dedicada e Shielded VM
gcloud compute instances create app-vm \
  --zone=us-central1-a \
  --boot-disk-type=pd-balanced --boot-disk-size=20GB \
  --service-account=app-sa@PROJECT.iam.gserviceaccount.com \
  --scopes=cloud-platform \
  --shielded-secure-boot --shielded-vtpm --shielded-integrity-monitoring

# Anexar Local SSD (efemero)
gcloud compute instances create cache-vm --zone=us-central1-a \
  --local-ssd=interface=NVME

# Snapshot de disco (incremental, global)
gcloud compute disks snapshot app-vm --zone=us-central1-a --snapshot-names=app-snap

# Habilitar OS Login no projeto
gcloud compute project-info add-metadata --metadata enable-oslogin=TRUE

# SSH (gera par persistente)
gcloud compute ssh app-vm --zone=us-central1-a

# Ler token da SA pelo metadata server (de dentro da VM)
curl -H "Metadata-Flavor: Google" \
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token"
```

## Pegadinhas de prova
- **Local SSD é EFEMERO** — perde dados ao parar/deletar a VM. Persistir = Persistent Disk.
- **Snapshot é global e incremental** — restaura em outra regiao; nao precisa de full a cada vez.
- **Metadata server sem header `Metadata-Flavor: Google` falha** — protecao anti-SSRF.
- **Default SA tem papel Editor** — amplo demais; questao de seguranca pede SA dedicada com IAM minimo.
- **Access scopes sao legado** — preferir IAM na SA; `cloud-platform` + IAM restrito > scopes granulares.
- **OS Login = acesso por IAM** (`roles/compute.osLogin`), nao por chave no metadata.
- **vTPM e integrity monitoring ja vem ligados** na Shielded VM; Secure Boot voce ativa.
- **Credencial vem do metadata server**, nunca colocar chave de SA no disco da VM.

## Fontes
- https://cloud.google.com/compute/docs/disks
- https://docs.cloud.google.com/compute/docs/metadata/overview
- https://docs.cloud.google.com/compute/docs/access/service-accounts
- https://cloud.google.com/compute/shielded-vm/docs/shielded-vm
