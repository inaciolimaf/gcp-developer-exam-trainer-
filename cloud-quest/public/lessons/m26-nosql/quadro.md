# 26 — NoSQL no Google Cloud: Firestore e Bigtable

## O que é

- **Firestore** — NoSQL de **documentos** (collections > documents > fields, JSON flexivel). Real-time updates + modo offline. Ancora AWS: **DynamoDB** (sabor document store).
  - **Native mode**: apps novos mobile/web; real-time + offline + client libraries ricas.
  - **Datastore mode**: backends de servidor/APIs; interface antiga do Datastore sobre storage do Firestore.
  - **Datastore (legado)** = ancestral do Firestore; GQL (parecido com SQL), sem joins/agregacao. Migrando para Firestore.
- **Bigtable** — NoSQL **wide-column**, escala **petabytes**, latencia de ms, milhoes de ops/s. Compativel com **API HBase**. Ancora AWS: **HBase / Keyspaces** (NAO DynamoDB).

## Quando usar

| Cenario | Escolha |
|---|---|
| Perfil de usuario, catalogo, app mobile/web com real-time/offline | Firestore **Native** |
| Backend de servidor/API novo (sem real-time/offline) | Firestore **Datastore mode** |
| Migracao de Datastore legado | Firestore **Datastore mode** |
| IoT, time-series, analytics tempo real, dados financeiros, > 1TB | **Bigtable** |
| Dataset < 1TB | **NAO** Bigtable — use Firestore |
| App transacional multi-linha | **NAO** Bigtable (so transacao de linha unica) |

## Pontos-chave

- Firestore: 1 modo por projeto (escolheu, ficou). Ambos os modos sao **strongly consistent** hoje.
- Indices Firestore: single-field automatico por campo; **composite index** para multi-campo; **index exemption** para campos grandes (texto). Indices custam latencia + storage.
- Localizacao Firestore: **regional** (mais barato, menor latencia de escrita, 99.99%) vs **multi-region** nam5/eur3 (99.999%, maior latencia de escrita).
- Transactions Firestore: **read-write** e **read-only**; max **500** writes/transaction (batch).
- Limites flexiveis: 1 write/s por document; regra **500/50/5** (comeca em 500 ops/s, +50% a cada 5 min).
- Bigtable: unico indice = **row key**. Nao e serverless (instance > cluster > nodes). **SSD** default; **HDD** so > 10TB raramente lidos. Replicacao multi-cluster aumenta disponibilidade/durabilidade.
- Design row key: do generico ao granular (`continente#pais#cidade`); evitar sequencial/timestamp no inicio (hotspot); usar timestamp reverso para dados recentes.

## Comando/CLI (referência)

```bash
# Firestore (gcloud)
gcloud firestore databases create --location=nam5
gcloud firestore export gs://MEU_BUCKET/exports
gcloud firestore indexes composite create --collection-group=users \
  --field-config field-path=city,order=ascending \
  --field-config field-path=age,order=descending

# Bigtable — usa 'cbt', NAO gcloud para dados
gcloud bigtable instances create minha-inst --cluster-config=...   # cria instancia
cbt createtable minha-tabela
cbt createfamily minha-tabela cf1
cbt set minha-tabela "continente#pais#cidade" cf1:populacao=12345
cbt read minha-tabela
```

## Pegadinhas de prova

- **Bigtable < 1TB = errado.** Bigtable recomendado a partir de 1TB; abaixo disso, Firestore.
- **gcloud nao gerencia dados do Bigtable** — a CLI e **cbt**. Export so via Dataflow, JAR Java ou comandos HBase (nao pelo console/gcloud).
- **Real-time/offline = so Native mode.** Datastore mode NAO tem real-time updates nem offline.
- **Native e strongly consistent** — nao marque "Native = eventual" (mito antigo).
- **Bigtable = transacao de linha unica** — nao serve para apps transacionais multi-linha.
- App novo mobile/web -> **Native**; migracao do Datastore -> **Datastore mode**.
- Row key sequencial/timestamp no inicio cria **hotspot** — distribua a carga.
- HDD no Bigtable so para grandes volumes raramente lidos (> 10TB); SSD para o resto.

## Fontes

- https://cloud.google.com/firestore/native/docs/firestore-or-datastore
- https://docs.cloud.google.com/bigtable/docs/choosing-ssd-hdd
- https://docs.cloud.google.com/bigtable/docs/overview
- https://cloud.google.com/firestore/docs/best-practices
