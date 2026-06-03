# AI Dev Tools on GCP — Gemini Code Assist & Cloud Assist

## What it is
- **Gemini Code Assist**: AI coding assistant in the IDE (dev time). ≈ **Amazon Q Developer / CodeWhisperer**.
- **Gemini Cloud Assist**: AI to operate/debug infra in production (runtime). ≈ **Amazon Q + CloudWatch / investigate mode**.
- Golden rule: **Code = in the IDE writing code; Cloud = in the Console operating the environment**.

## When to use
- **Code completion, generating a function from a comment, explain/document** → Code Assist.
- **Generating unit tests, code debugging** → Code Assist.
- **Root-cause analysis of an incident, finding the cause by looking at logs/metrics** → Cloud Assist (investigations).
- **AI-assisted observability / troubleshoot in prod** → Cloud Assist.

## Key points
- Code Assist runs on: VS Code, JetBrains, Android Studio, **Cloud Shell Editor**, **Cloud Workstations** (via Cloud Code).
- Editions: **Individual (free)**, **Standard**, **Enterprise**.
- **Enterprise** adds **code customization** = trains/anchors on your **private repos** (GitHub/GitLab/Bitbucket) → "context engineering".
- **Source citations**: cites the source when it copies a known snippet.
- **`.aiexclude`**: controls what the AI can see (like a `.gitignore` for the AI).
- **Agent mode / agentic chat**: multi-step tasks with tools and **MCP**.
- **Cloud Assist investigations** produce **Observations**: ranked insights about logs, configs and metrics, with a link to the source.
- Trigger an investigation from: **Logs Explorer**, a **Cloud Monitoring** alert, Cloud Hub, the Cloud Assist chat panel.

## Command/CLI (reference)
- Not CLI-centric; the main integration is IDE + Console.
- IDE setup: **Cloud Code** extension + Gemini Code Assist (VS Code / JetBrains).
- Context exclusion: create an **`.aiexclude`** file at the project root.
- Usage metrics: **Generate Gemini Code Assist metrics** (Cloud Logging/Monitoring).
- Cloud Assist: **"Create investigation"** button in the Console (no dedicated command).

## Exam traps
- **Code Assist ≠ Cloud Assist**: "generate test/code" = Code; "root cause/troubleshoot/observability" = Cloud.
- **Code customization with private repos is Enterprise only** — don't attribute it to free/Standard.
- **`.aiexclude` and source citations** belong to **Code Assist**, not Cloud Assist.
- **Investigations** analyze logs + metrics + configs and produce **Observations** (they don't "fix it on their own").
- Cloud Shell Editor and Cloud Workstations already ship Code Assist — no need to set up a local IDE.

## Sources
- https://docs.cloud.google.com/gemini/docs/codeassist/overview
- https://docs.cloud.google.com/gemini/docs/codeassist/code-overview
- https://docs.cloud.google.com/gemini/docs/cloud-assist/investigations
- https://www.augmentcode.com/tools/gemini-code-assist-vs-amazon-q-cloud-native-fit-and-toolchains
