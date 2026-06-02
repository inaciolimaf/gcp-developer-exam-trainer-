# Generative AI em apps com as APIs Gemini (Vertex AI)

> Analogia AWS: **Gemini no Vertex AI ≈ Amazon Bedrock** (API gerenciada de foundation models, sem GPU/servidor de inferência pra gerenciar).

## O que é
- API gerenciada para consumir modelos **Gemini** (texto, imagem, multimodal) dentro do seu app.
- Acesso via **Google Gen AI SDK** (`google-genai`) ou REST (`generateContent`).
- Backend **Vertex AI** = caminho corporativo, dentro do projeto GCP, com IAM.
- O foco do PCD é **consumir** a API, não treinar/fazer fine-tuning.

## Quando usar
- App precisa de geração de texto, sumarização, chat, classificação, extração ou visão.
- Quer governança, IAM e ficar dentro do projeto/VPC → use backend **Vertex AI** (não a Gemini Developer API com API key).
- Resposta progressiva (chat) → use **streaming**.
- Modelo precisa acionar suas funções/APIs → use **function calling** (≈ tool use do Bedrock).

## Pontos-chave
- **Client**: aponte para o Vertex AI com `GOOGLE_GENAI_USE_VERTEXAI=True` + `project` + `location`.
- **Método principal**: `generateContent` (e a variante streaming).
- **Modelos**: `gemini-2.5-flash` (rápido/barato, default) vs `gemini-2.5-pro` (raciocínio pesado).
- **Multimodal nativo**: texto + imagem no mesmo `contents`, sem modelo separado de visão.
- **Auth (produção)**: **ADC + IAM**, não API key no código.
- **IAM**: identidade precisa de `roles/aiplatform.user` para chamar o Vertex AI.
- **Config**: `GenerateContentConfig` controla temperatura, safety settings e function calling.

## Comando/CLI (referência)
```bash
# Auth local (ADC) — produção usa service account do Cloud Run/GKE
gcloud auth application-default login

# Variáveis que apontam o SDK pro backend Vertex AI
export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
export GOOGLE_CLOUD_LOCATION=global
export GOOGLE_GENAI_USE_VERTEXAI=True

pip install --upgrade google-genai
```
```python
from google import genai

client = genai.Client()  # usa as env vars acima (Vertex AI + ADC)
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Resuma este texto: ...",
)
print(response.text)
```

## Pegadinhas de prova
- **Vertex AI vs Gemini Developer API**: Vertex = IAM/projeto/produção; API key = caminho simples e menos governado. Em produção GCP, escolha **Vertex + ADC**.
- **403 ao chamar o Gemini** num Cloud Run/GKE → service account sem `roles/aiplatform.user`. Não é problema de rede.
- **Não confunda com treinar modelo**: PCD cobra *integrar/consumir* GenAI API, não fine-tuning nem MLOps (isso é ML Engineer).
- **API key hardcoded** no código = resposta errada; prefira ADC + IAM.
- **Multimodal**: não existe "modelo de visão separado" — o mesmo `generateContent` aceita imagem.
- **SDK novo**: é `google-genai` (Gen AI SDK). O antigo `vertexai.generative_models` está sendo descontinuado.

## Fontes
- https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart
- https://cloud.google.com/learn/certification/cloud-developer/
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/reference/libraries
- https://cloud.google.com/vertex-ai
