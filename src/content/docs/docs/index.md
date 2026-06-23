---
title: Overview
description: Map of Thumbrella documentation organized by audience and topic.
---

Thumbrella documentation is organized into sections tailored to different roles — from application developers integrating a thumbnail client to platform maintainers working on the internals.

## Introduction

New to Thumbrella? Start here for a product overview, repository map, and guidance on which docs path fits your needs.

- [Introduction](/docs/introduction/overview) — What Thumbrella is and who it serves.
- [Project and Author](/docs/introduction/project-and-author) — Repository layout and project background.
- [Choose a Path](/docs/introduction/choose-a-path) — Decision guide for your role.
- [FAQ](/docs/introduction/faq) — Common questions across all audiences.

## Clients

Everything you need to generate thumbnails from application code. Covers installation, configuration, request options, error handling, and the API contract.

- [Clients](/docs/clients/overview) — Section overview and page index.
- [Quickstart](/docs/clients/quickstart) — First thumbnail in under a minute.
- [Web Client (JS/TS)](/docs/clients/web-client) — TypeScript and JavaScript integration.
- [Request Options](/docs/clients/request-options) — Resize, crop, format, and timing parameters.
- [API Reference](/docs/clients/api-reference) — Endpoint and parameter contract.

## Server

Run and operate a Thumbrella instance — whether self-hosted on your own hardware, deployed through an AI compute platform, or managed as a long-running service.

- [Server](/docs/server/overview) — Section overview and page index.
- [Self-Hosted](/docs/server/self-hosted) — Run the binary on your own infrastructure.
- [AI Platforms](/docs/server/ai-platforms) — Deploy through Replicate, Fal.ai, and similar.
- [Configuration](/docs/server/configuration) — Runtime flags, environment variables, and policies.
- [Operations](/docs/server/operations) — Monitoring, logging, upgrades, and backups.
- [CLI Reference](/docs/server/cli-reference) — Full command and option reference.

## Service

Manage your hosted Thumbrella account — tokens, usage limits, billing, and the service dashboard.

- [Service](/docs/service/overview) — Section overview and page index.
- [Account Management](/docs/service/account-management) — Create and configure your account.
- [API Tokens](/docs/service/api-tokens) — Token lifecycle and permission scoping.
- [Usage and Limits](/docs/service/usage-and-limits) — Quotas, rate limits, and scaling.
- [Pricing and Billing](/docs/service/pricing-and-billing) — Tiers, costs, and invoicing.

## Developers

Platform internals, architecture decisions, hosting topology, and the cross-repo development workflow. This section is for contributors and maintainers.

- [Developers](/docs/developers/overview) — Section overview and page index.
- [Architecture](/docs/developers/architecture) — System boundaries, data flow, and trust zones.
- [Internals](/docs/developers/internals) — Renderer pipeline and execution model.
- [Hosting Strategy](/docs/developers/hosting-strategy) — Cloudflare, workers, containers, and local dev.
- [Repos and Ownership](/docs/developers/repos-and-ownership) — Codebase map and change workflow.
