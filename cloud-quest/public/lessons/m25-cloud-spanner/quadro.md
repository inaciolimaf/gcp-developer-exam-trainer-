# 25 — Cloud Spanner

## O que é
- Banco **relacional, distribuído globalmente**, totalmente gerenciado, para cargas mission-critical.
- SQL real: schema, joins, transações **ACID** — **e** consistência forte global ao mesmo tempo.
- **Consistência forte** via **TrueTime** (relógio distribuído) → **external consistency** (nível mais forte).
- **Escala horizontal** para **leitura E escrita**; dados em **splits** (ordenados por primary key), replicados entre zonas/regiões, rebalanceados automaticamente → até petabytes.
- SLA **99,999%** multi-região / 99,99% regional (vs. Cloud SQL 99,95%).
- Âncora AWS: ≈ **Aurora DSQL / Aurora Global** (relacional global). Parecido com a *proposta* de **DynamoDB global tables**, mas DynamoDB é **NoSQL + consistência eventual**; Spanner é **relacional + consistência forte**.

## Quando usar
- Precisa das **3 coisas juntas**: escala horizontal + alcance global + consistência forte. (Ex.: financeiro, gaming global, supply chain.)
- **Cloud SQL** → relacional regional, padrão, mais barato (escala escrita só no primário).
- **AlloyDB** → Postgres com performance bem alta, mas ainda regional.
- **Spanner** → custo alto (paga por **nodes** + **storage**); não escolha só por ser impressionante.

## Pontos-chave
- Multi-região: leituras mais rápidas, **pequeno aumento na latência de escrita** (confirma em várias regiões).
- **Interleaved tables**: pai + filho (ex.: user + to-dos) no **mesmo node** → melhor desempenho de leitura conjunta.
- **Primary key design**: evite valores **monotonicamente crescentes** (ex.: timestamp) como início da chave → hotspot. Timestamp vai na **2ª** parte da chave.
- 3 modos de transação: **read-write (locking)** = gravações ACID; **read-only** = leituras consistentes sem lock; **partitioned DML** = update em massa sem travar a tabela inteira.
- Boas práticas: compute na **mesma região** do Spanner; manter **CPU < 65%** (senão add nodes); **batch DML**; **stale reads** se tolera dados levemente desatualizados e é sensível a latência.

## Comando/CLI (referência)
- `gcloud spanner instances create` — criar instância (config regional/multi-região, nº de nodes).
- `gcloud spanner databases create` — criar database.
- `gcloud spanner databases ddl update` — aplicar schema/DDL.
- **Export**: NÃO existe export pelo `gcloud` → use **Cloud Console** ou **Dataflow**.

## Pegadinhas de prova
- "Relacional + global + consistência forte" → **Spanner** (não Cloud SQL, não DynamoDB).
- "TrueTime" / "external consistency" → **Spanner**.
- Escalar **escrita** horizontalmente → **Spanner** (Cloud SQL só escala leitura via read replicas).
- **Export do Spanner**: só **Console** ou **Dataflow**, **não** `gcloud`.
- Primary key com timestamp no início = **hotspot** (errado). Timestamp na 2ª parte.
- Spanner é **caro** — escolha só quando precisar de global + forte + escala.

## Fontes
- https://docs.cloud.google.com/spanner/docs/true-time-external-consistency
- https://docs.cloud.google.com/spanner/docs/instance-configurations
- https://cloud.google.com/blog/topics/developers-practitioners/your-google-cloud-database-options-explained
