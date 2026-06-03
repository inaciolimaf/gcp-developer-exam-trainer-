# Generative AI in apps with the Gemini APIs (Vertex AI)

> AWS analogy: **Gemini on Vertex AI ≈ Amazon Bedrock** (managed API of foundation models, no GPU/inference server to manage).

## What it is
- Managed API to consume **Gemini** models (text, image, multimodal) inside your app.
- Access via the **Google Gen AI SDK** (`google-genai`) or REST (`generateContent`).
- **Vertex AI** backend = enterprise path, inside the GCP project, with IAM.
- The PCD focus is on **consuming** the API, not training/fine-tuning.

## When to use
- App needs text generation, summarization, chat, classification, extraction, or vision.
- Want governance, IAM, and to stay inside the project/VPC → use the **Vertex AI** backend (not the Gemini Developer API with an API key).
- Progressive response (chat) → use **streaming**.
- Model needs to call your functions/APIs → use **function calling** (≈ Bedrock tool use).

## Key points
- **Client**: point to Vertex AI with `GOOGLE_GENAI_USE_VERTEXAI=True` + `project` + `location`.
- **Main method**: `generateContent` (and the streaming variant).
- **Models**: `gemini-2.5-flash` (fast/cheap, default) vs `gemini-2.5-pro` (heavy reasoning).
- **Native multimodal**: text + image in the same `contents`, no separate vision model.
- **Auth (production)**: **ADC + IAM**, not an API key in code.
- **IAM**: the identity needs `roles/aiplatform.user` to call Vertex AI.
- **Config**: `GenerateContentConfig` controls temperature, safety settings, and function calling.

## Command/CLI (reference)
```bash
# Local auth (ADC) — production uses the Cloud Run/GKE service account
gcloud auth application-default login

# Variables that point the SDK to the Vertex AI backend
export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
export GOOGLE_CLOUD_LOCATION=global
export GOOGLE_GENAI_USE_VERTEXAI=True

pip install --upgrade google-genai
```
```python
from google import genai

client = genai.Client()  # uses the env vars above (Vertex AI + ADC)
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Summarize this text: ...",
)
print(response.text)
```

## Exam traps
- **Vertex AI vs Gemini Developer API**: Vertex = IAM/project/production; API key = simple, less governed path. In production GCP, pick **Vertex + ADC**.
- **403 when calling Gemini** from a Cloud Run/GKE → service account missing `roles/aiplatform.user`. It is not a network problem.
- **Don't confuse it with training a model**: PCD tests *integrating/consuming* the GenAI API, not fine-tuning or MLOps (that's ML Engineer).
- **Hardcoded API key** in code = wrong answer; prefer ADC + IAM.
- **Multimodal**: there is no "separate vision model" — the same `generateContent` accepts images.
- **New SDK**: it's `google-genai` (Gen AI SDK). The old `vertexai.generative_models` is being deprecated.

## Sources
- https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart
- https://cloud.google.com/learn/certification/cloud-developer/
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/reference/libraries
- https://cloud.google.com/vertex-ai
