# 20 — IAM & Organização de Projetos

## O que é
- **Resource hierarchy**: árvore que organiza tudo no GCP — `Organization → Folder → Project → Resource`.
  - Organization = topo (empresa) → âncora AWS: **AWS Organization**.
  - Folder = agrupamento opcional (ex.: departamento) → âncora AWS: **OU**.
  - Project = unidade fundamental; agrupa recursos e exige billing account → âncora AWS: **conta (account)**.
  - Resource = VM, bucket, DB etc.
- **Cloud IAM** ≈ **AWS IAM**: controla *quem* (member) pode fazer *o quê* (role) em *qual* recurso.
- **IAM policy** = lista de **bindings**. **Binding** = `member + role` anexado a um resource.
- **Members / principals**: User, Group, Service Account, Workspace domain, `allUsers` (público), `allAuthenticatedUsers`.

## Quando usar
- **Project por app, por ambiente** (A1-Dev, A1-Prod, A2-Dev, A2-Prod) → isolamento Dev/Prod.
- **Folder por departamento** ou para recursos compartilhados.
- **Group** sempre que possível: vincule role ao grupo, gerencie pessoas entrando/saindo do grupo.
- **Service account** dedicada por aplicação, com permissões mínimas (não compartilhe uma SA "coringa").
- **Basic roles** só se não houver alternativa; prefira **predefined**; **custom** quando nenhum predefined encaixa.

## Pontos-chave
- **3 tipos de role**:
  - **Basic / primitive**: Owner, Editor, Viewer — amplos, projeto inteiro, evitar em prod.
  - **Predefined**: granulares, mantidos pela Google por serviço — recomendado.
  - **Custom**: você define o conjunto de permissions — máximo controle, suporta least privilege.
- **Herança de política**: definível em qualquer nível (org/folder/project/resource).
  - Recursos **herdam** as políticas dos pais.
  - Política efetiva = **UNIÃO** (resource + todos os ancestrais) → **aditiva** e **transitiva**.
  - **Não dá para restringir embaixo o que foi concedido em cima** (allow policy não nega).
- **Princípio do menor privilégio**: dê só o mínimo necessário.
- **Separação de tarefas**: ações sensíveis envolvem 2+ pessoas (ex.: App Engine Deployer vs Service Admin).
- **Service account** = identidade de aplicação/recurso (não é pessoa).
- **Onde conceder acesso**: no nível onde o **recurso** vive (bucket no Projeto B → role no Projeto B).
- Identidade corporativa: **Cloud Identity / Google Workspace**; federação com AD/Azure AD via SAML/SSO.
- Free trial não tem Organization/Folders — só projetos soltos.

## Comando/CLI (referência)
```bash
# Conceder um binding (member + role) num projeto
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:ana@exemplo.com" --role="roles/storage.objectViewer"

# Mesmo conceito para uma service account como member
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:vm-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Ver a policy efetiva
gcloud projects get-iam-policy PROJECT_ID

# Criar service account / custom role
gcloud iam service-accounts create vm-sa --display-name="VM SA"
gcloud iam roles create meuRole --project=PROJECT_ID --permissions=storage.objects.get
```

## Pegadinhas de prova
- **Herança é aditiva**: permissão concedida na Organization/Folder **não** pode ser removida num nível inferior. Não confunda com Deny da AWS.
- **Política efetiva = união** com os pais (transitiva), não substituição.
- **Basic ≠ recomendado**: se a questão pede least privilege, a resposta é **predefined** ou **custom**, nunca Owner/Editor.
- **allUsers = público na internet** — quase sempre errado quando se pede acesso restrito.
- **Acesso cross-project**: conceda o role onde o **recurso** está (Projeto B), à **service account** da VM (não ao Projeto A).
- **Service account é member E pode receber roles** — é identidade, não pessoa.
- Free trial: **sem Organization/Folders**; eles exigem Cloud Identity/Workspace.
- Billing: cada projeto liga a 1 billing account; uma billing account serve vários projetos.

## Fontes
- https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy
- https://docs.cloud.google.com/iam/docs/resource-hierarchy-access-control
- https://docs.cloud.google.com/iam/docs/roles-overview
- https://docs.cloud.google.com/iam/docs/overview
