# 23 — Cloud SQL

## O que é
- Banco de dados **relacional totalmente gerenciado** do GCP. Âncora AWS: **≈ Amazon RDS**.
- Engines suportados (só esses 3): **MySQL, PostgreSQL, SQL Server**.
- **Serviço REGIONAL** (zona ou região) — **não existe Cloud SQL global**.
- Google cuida de: patching, replicação, backups, failover, criptografia. Você cuida de tabelas/queries.
- Storage: SSD (recomendado p/ performance) ou HDD; **autogrowth** de armazenamento.

## Quando usar
- Carga **relacional simples** MySQL/PostgreSQL/SQL Server; migrar banco **on-premises** p/ a nuvem; reduzir manutenção.
- Regra de bolso (Cloud SQL × AlloyDB × Spanner):
  - **Cloud SQL** = default barato e simples.
  - **AlloyDB** = precisa de PostgreSQL com muito mais performance/analytics e Cloud SQL não basta.
  - **Spanner** = escala "infinita", banco **global** multi-região, ou **99,999%** de disponibilidade. (Caro — só se justificar.)
- Gatilhos p/ Spanner: centenas de TB, multi-região, escala horizontal de escrita, 5 noves.

## Pontos-chave
- **HA (regional)** = primária numa zona + **standby** noutra zona, **replicação síncrona** → ≈ Multi-AZ do RDS.
- **Failover automático** em falha zonal; instância fica indisponível por **~60s**.
- Failover **não reverte sozinho** quando a zona original volta (a antiga primária vira novo standby).
- **Standby NÃO atende leitura** — passivo, só p/ failover.
- **Read replicas** (assíncronas) p/ escalar leitura: same-zone/cross-region/externa (inclui on-prem). São **separadas do standby**.
- **Backups automáticos** (janela configurável) + **on-demand**; retenção regional ou multirregional.
- **PITR (point-in-time recovery)**: restaura p/ instante específico. **Requer logging de transações**: *binary logging* no MySQL, *write-ahead logging (WAL)* no PostgreSQL.
- HA/read replica também **exigem backups automáticos + binary logging** (MySQL) / **WAL** (PostgreSQL) ativados.
- **Manutenção**: janela preferida configurável; criptografia automática em repouso.
- Escala = **vertical** (aumenta a máquina); teto na casa de dezenas de TB por instância.

## Comando/CLI (referência)
- Conectar via Cloud Shell: `gcloud sql connect MINHA-INSTANCIA --user=root`
- Criar instância: `gcloud sql instances create NOME --database-version=MYSQL_8_0 --region=us-central1`
- Ativar HA: flag `--availability-type=REGIONAL` (zonal = `ZONAL`)
- Criar read replica: `gcloud sql instances create REPLICA --master-instance-name=PRIMARIA`
- Requer a **Cloud SQL Admin API** habilitada.

## Pegadinhas de prova
- Cloud SQL é **regional, nunca global** (se a questão pede global → Spanner).
- Engines = **apenas** MySQL, PostgreSQL, SQL Server (Oracle/Aurora NÃO).
- **Standby de HA ≠ read replica**: standby não serve leitura; não dá p/ conectar nele com a primária ativa.
- **PITR exige logging de transações** (binary logging no MySQL, WAL no PostgreSQL); HA exige backups automáticos + esse logging.
- Failover **não volta automaticamente** p/ a zona original.
- Disponibilidade de **99,999%** → Spanner, não Cloud SQL.
- Escala horizontal de **escrita** / centenas de TB → Spanner (Cloud SQL escala vertical).

## Fontes
- https://docs.cloud.google.com/sql/docs/mysql/high-availability
- https://docs.cloud.google.com/sql/docs/mysql/backup-recovery/pitr
- https://cloud.google.com/blog/topics/developers-practitioners/your-google-cloud-database-options-explained
