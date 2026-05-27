---
title: AI Platforms
description: Run Thumbrella through hosted AI platforms like Replicate and Fal.ai.
sidebar:
  order: 3
---

Thumbrella is published as a model on several hosted AI compute platforms. If your team already provisions workloads through one of these marketplaces, you can add Thumbrella to the same flow without deploying anything yourself.

## Replicate

```sh
replicate run thumbrella/thumb \
  input=https://example.com/media.mp4
```

Use your existing Replicate account and API key. Replicate bills for the compute; Thumbrella does not add a separate charge in this mode.

## Fal.ai

```python
import fal_client

result = fal_client.run(
    "thumbrella/thumb",
    arguments={"input": "https://example.com/media.jpg"},
)
```

## When to choose this path

- Your project already uses Replicate, Fal.ai, or a similar platform for other workloads.
- You prefer marketplace-based provisioning and billing over operating a binary or calling an external API.
- You want Thumbrella to colocate with other compute-heavy tasks (e.g., diffusion models, video encoding).

## Limitations

- Platform billing applies — check Replicate/Fal pricing for your expected volume.
- Cold-start latency is higher than the hosted service or a running local binary.
- Not a good fit for tight latency budgets or very high request rates.

## Next steps

- [Explore the hosted service](/docs/getting-started/online-service) for lower latency and a persistent cache.
- [Read the web client docs](/docs/clients/web-client) to call Thumbrella from your application code.
