# 12 — Cloud KMS (Criptografia)

## O que é
- **Cloud KMS** (Key Management Service) = serviço gerenciado para criar, usar, rotacionar e destruir chaves criptográficas. **≈ AWS KMS**.
- Cria chaves **simétricas** e **assimétricas**; expõe API para **encrypt / decrypt / sign**.
- Hierarquia: **Key Ring** (chaveiro, agrupa chaves, tem *location*) → **Key** → **Key Version**.
- **Protection levels**: `SOFTWARE`, `HSM` (≈ AWS CloudHSM), `EXTERNAL` (EKM).
- Resolve criptografia para os 3 estados de dado: **at rest**, **in transit**, **in use**.

## Quando usar
- Quer **controlar** as chaves de criptografia at rest dos serviços GCP (GCS, discos do Compute, Cloud SQL, BigQuery) → **CMEK**.
- Precisa de **HSM** por exigência regulatória/compliance.
- Quer criptografar/descriptografar/assinar dados pequenos (≤ 64 KiB) ou **wrapped DEKs** via API.
- Se NÃO quer gerenciar nada: deixa o default **Google-managed** (já vem ligado).

## Pontos-chave
- **Simétrica**: mesma chave encripta e decripta (rápida; desafio = compartilhar a chave). **Assimétrica**: pública encripta / privada decripta (RSA).
- **Purpose** da key escolhido na criação: symmetric encrypt/decrypt, asymmetric decrypt, asymmetric sign.
- **Envelope encryption**: **DEK** (Data Encryption Key) encripta o dado → DEK é *wrapped* pela **KEK** (Key Encryption Key) que fica no KMS e **nunca sai**. 1 KEK protege N DEKs. CMEK = a KEK é sua.
- **Rotação**: simétrica → **automática** (rotation period, gera novas versions); assimétrica → **manual**.
- **IAM**: conceder `roles/cloudkms.cryptoKeyEncrypterDecrypter` **na chave** ao service account/agent que vai usá-la.
- Key Ring é **global** ou **regional**; **External (EKM)** só em ring regional, não global.
- Habilitar a **API do KMS** antes de usar.

## Comando/CLI (referência)
```
gcloud services enable cloudkms.googleapis.com
gcloud kms keyrings create my-keyring --location=global
gcloud kms keys create my-key --keyring=my-keyring --location=global \
    --purpose=encryption --rotation-period=90d --next-rotation-time=...
# dar permissão de uso a um service account
gcloud kms keys add-iam-policy-binding my-key --keyring=my-keyring --location=global \
    --member=serviceAccount:SA_EMAIL --role=roles/cloudkms.cryptoKeyEncrypterDecrypter
```

## Pegadinhas de prova
- **Google-managed × CMEK × CSEK** (a diferença mais cobrada):
  - **Google-managed**: Google cria/rotaciona, **default**, zero config, sem custo extra. ≈ AWS SSE com chave da AWS.
  - **CMEK** (Customer-Managed): você cria/gerencia a **KEK no Cloud KMS**; controla rotação, IAM, destruição. ≈ AWS customer managed key.
  - **CSEK** (Customer-Supplied): você **fornece sua própria AES-256** de fora; Google **não armazena** a chave; só GCS e Compute Engine. ≈ AWS **SSE-C**.
- Encriptação at rest é **sempre ligada** por padrão — CMEK/CSEK só trocam *quem controla a chave*, não "ligam" a criptografia.
- Cloud KMS **não** criptografa dados grandes direto (**limite 64 KiB**) → use **envelope encryption** (wrap de DEK).
- **DEK ≠ KEK**: DEK criptografa o dado; KEK (a do KMS) criptografa a DEK.
- Rotação **automática só para simétricas**; assimétrica é manual.
- **External (EKM)** indisponível em key ring **global**.
- Erro clássico na demo: VM/serviço sem `cryptoKeyEncrypterDecrypter` na chave → falha ao usar CMEK.

## Fontes
- https://docs.cloud.google.com/kms/docs/envelope-encryption
- https://cloud.google.com/kms/docs/cmek
- https://docs.cloud.google.com/kms/docs/protection-levels
- https://cloud.google.com/kms/docs/key-rotation
