# 27 — Asynchronous Communication: Pub/Sub and Cloud Tasks

## What it is

- **Cloud Pub/Sub** — managed, global, auto-scaling asynchronous messaging. Publishers send messages to a **topic**; subscribers receive them via **subscriptions**. AWS: ≈ **SNS + SQS** in a single service (push *and* pull).
- **Cloud Tasks** — a queue of **HTTP tasks**: each task calls a specific HTTP endpoint (method, URL, body), with configurable **rate limiting** and **retry**. AWS: ≈ **SQS**, but with explicit invocation and push-only.
- **Cloud Scheduler** — managed cron (UNIX cron format). Targets: HTTP, a Pub/Sub topic, or App Engine. AWS: ≈ **EventBridge Scheduler / CloudWatch cron**.

| Concept | Invocation | Models | AWS |
|---|---|---|---|
| Pub/Sub | implicit (publisher doesn't know the consumer) | push + pull | SNS + SQS |
| Cloud Tasks | explicit (you choose the URL) | push only | SQS |
| Cloud Scheduler | scheduled (cron) | fires HTTP/Pub/Sub | EventBridge cron |

## When to use

- **Pub/Sub** — event ingestion, streaming analytics, fan-out (1 event → many consumers), decoupling event-driven microservices.
- **Cloud Tasks** — defer work for later without holding the client; control the rate/concurrency of a downstream service; invoke a specific HTTP endpoint reliably.
- **Cloud Scheduler** — any recurring job by time (cron): trigger HTTP, publish to Pub/Sub, start/stop VMs.

## Key points

- **Subscription = copy**: each subscription receives ALL the topic's messages. Multiple clients on the SAME subscription → messages are **split** (load balancing). Different subscriptions → **fan-out** (each one receives everything).
- **At-least-once** is the default → the consumer must be **idempotent**. There is exactly-once (pull). No **ack** within the **ack deadline** → redelivery.
- **Ordering**: off by default. Turn it on with an **ordering key** + ordering enabled on the subscription, same region.
- **Dead-letter topic**: after N failed attempts, the message goes to the DLQ for offline debugging.
- **Cloud Tasks**: dispatch rate, max concurrent dispatches, retry with exponential backoff — all per queue.
- **Cloud Scheduler today does NOT require App Engine** (only if the target is App Engine).

## Command/CLI (reference)

```bash
# Pub/Sub
gcloud pubsub topics create orders
gcloud pubsub subscriptions create orders-sub --topic=orders            # pull
gcloud pubsub subscriptions create orders-push --topic=orders \
  --push-endpoint=https://meu-servico/handler                           # push
gcloud pubsub subscriptions create orders-sub --topic=orders \
  --dead-letter-topic=orders-dlq --max-delivery-attempts=5              # dead-letter
gcloud pubsub subscriptions create ord-sub --topic=orders --enable-message-ordering
gcloud pubsub topics publish orders --message="hello" --ordering-key=k1

# Cloud Tasks
gcloud tasks queues create my-queue
gcloud tasks queues update my-queue \
  --max-dispatches-per-second=10 --max-concurrent-dispatches=5 \
  --max-attempts=5                                                      # rate + retry
gcloud tasks create-http-task --queue=my-queue \
  --url=https://meu-servico/run --method=POST --body-content='{"id":1}'

# Cloud Scheduler
gcloud scheduler jobs create http nightly \
  --schedule="0 2 * * *" --uri=https://meu-servico/cron --http-method=POST
gcloud scheduler jobs create pubsub publish-job \
  --schedule="*/5 * * * *" --topic=orders --message-body="tick"
```

## Exam traps

- **Fan-out vs load balancing**: the same subscription with multiple consumers SPLITS messages; distinct subscriptions DUPLICATE them. Mixing this up is a classic mistake.
- **At-least-once by default** → assume duplicates; exactly-once is opt-in (pull). Idempotency is mandatory.
- **Push in Pub/Sub** requires an **HTTPS endpoint** (webhook). Ordering with push: only 1 outstanding message per ordering key — push is not recommended for heavy ordering.
- **Cloud Tasks is push only, no pull**; and invocation is **explicit** (you define the URL). If the question says "the publisher doesn't know who consumes" → Pub/Sub, not Tasks.
- **Cloud Scheduler ≠ Cloud Tasks**: Scheduler is by TIME (cron); Tasks is an execution queue with rate/retry. Scheduler fires, Tasks/Pub/Sub process.
- **Old material says Scheduler requires App Engine** — outdated. You only need App Engine if the TARGET is App Engine.
- **Dead-letter** does not preserve order.

## Sources

- https://cloud.google.com/pubsub/docs/subscriber
- https://cloud.google.com/pubsub/docs/ordering
- https://cloud.google.com/pubsub/docs/dead-letter-topics
- https://docs.cloud.google.com/tasks/docs/configuring-queues
- https://docs.cloud.google.com/scheduler/docs/overview
