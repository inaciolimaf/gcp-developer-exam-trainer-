# 21 — Cloud APIs e Client Libraries

## O que é

- **Cloud API**: quase todo serviço GCP expõe uma API, aceita **JSON REST** e **gRPC**. Dá pra chamar direto, mas você carrega todo o baixo nível (HTTP, TLS, OAuth token, retries).
- **Client Libraries**: o jeito recomendado de chamar Cloud APIs a partir do código. Equivalente AWS: **AWS SDK**.
- Dois tipos (pegadinha de nome):
  - **Google API Client Libraries** (antigas): só JSON REST, auto-geradas, **sem gRPC**.
  - **Cloud Client Libraries** (novas, recomendadas): idiomáticas, REST **e** gRPC, melhor performance.
- **gRPC**: payload binário (Protobuf) + HTTP/2 → até ~10x mais throughput que JSON REST.

## Quando usar

| Situação | Use |
|---|---|
| Chamar serviço GCP do seu código | Cloud Client Library (se existir) |
| Library nova indisponível p/ o serviço | Google API Client Library (legado) |
| Máximo desempenho | gRPC sob a Cloud Client Library |
| Código fora do Google Cloud | Cloud Client Library + chave de SA via GOOGLE_APPLICATION_CREDENTIALS |
| Código dentro do GCP (Cloud Run, GKE, GCE…) | SA anexada ao recurso (sem chave em arquivo) |

## Pontos-chave

- **Auth = ADC (Application Default Credentials)** — equivale à credential chain do AWS SDK. Ordem de busca:
  1. Variável `GOOGLE_APPLICATION_CREDENTIALS` → chave de service account.
  2. Credenciais locais do gcloud (`gcloud auth application-default login`).
  3. Service account **anexada ao recurso** (Cloud Run, App Engine, GCE, Cloud Functions, GKE).
  4. Nada → **erro**.
- Boa prática produção: **anexe SA ao recurso**, não use chave em arquivo. Chave de SA só p/ código fora do GCP.
- Cloud API só aceita **TLS**; a library cuida disso automaticamente.
- Precisa **ativar (enable)** a API no projeto antes de usar.
- **Tratamento de erro** (decore):

| Código | Significado | Ação |
|---|---|---|
| 200 | OK | nada |
| 400 | argumento inválido | corrija a request (não retry) |
| 401 | não autenticado | token OAuth válido |
| 403 | permissão negada | adicione IAM role/permissão |
| 404 | recurso não existe | nada a fazer |
| 429 | recurso esgotado / rate limit | **retry com exponential backoff** |
| 500 | erro interno servidor | **retry com exponential backoff** |
| 503 | serviço indisponível | **retry backoff** (começa em ~1s) |

- **Exponential backoff + jitter**: dobre o atraso a cada falha e some um valor **aleatório** (jitter) p/ não sincronizar clientes. Retente só 408/429/5xx.
- **Cloud Storage rate**: bucket novo ~**1000 writes/s** e ~**5000 reads/s**; não dobre a taxa em menos de **20 min**.
- Boas práticas de consumo: **pagination** (listas grandes), **batching** (várias ops numa request), **partial response / field mask** (só os campos necessários).
- Cloud Console tem **API dashboard**: tráfego, taxas de erro, latência (média e p95).

## Comando/CLI (referência)

```bash
# Instalar Cloud Client Library
pip install --upgrade google-cloud-storage          # Python
npm install --save @google-cloud/storage            # Node.js
# Java: dependência com.google.cloud:google-cloud-storage no pom.xml / Gradle

# ADC: apontar chave de service account (código fora do GCP)
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/chave-sa.json"

# Ativar API antes de usar
gcloud services enable storage.googleapis.com

# Login ADC local (dev)
gcloud auth application-default login
```

## Pegadinhas de prova

- **Cloud Client Libraries (novas) vs Google API Client Libraries (antigas)** — só as novas têm **gRPC**; as novas são as recomendadas.
- **ADC procura `GOOGLE_APPLICATION_CREDENTIALS` PRIMEIRO**, depois a SA do recurso. Não inverta a ordem.
- Dentro do GCP, **não use chave de SA em arquivo** — anexe a SA ao recurso (best practice).
- **429 e 5xx → retry com backoff**. **4xx (400/401/403/404) → NÃO retry**, conserte a request.
- Backoff sem **jitter** é resposta incompleta — jitter evita thundering herd.
- Bucket novo do Cloud Storage: **1000 writes/s, 5000 reads/s**; rampa **máx. dobrar a cada 20 min**.
- **TLS é automático** com client libraries — motivo extra p/ não chamar a API crua.
- **partial response = field mask**: pedir só os campos necessários (economiza banda), não é o mesmo que pagination.

## Fontes

- https://docs.cloud.google.com/apis/docs/client-libraries-explained
- https://docs.cloud.google.com/docs/authentication/client-libraries
- https://docs.cloud.google.com/storage/docs/request-rate
- https://docs.cloud.google.com/storage/docs/retry-strategy
