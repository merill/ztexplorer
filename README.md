# Microsoft Zero Trust Framework Explorer

An interactive explorer for Microsoft's [Zero Trust Workshop](https://zerotrust.microsoft.com/). Browse all seven pillars, their functional areas, and tasks that make up the framework — each viewable as an interactive mindmap.

**Live site:** [zerotrustexplorer.merill.net](https://zerotrustexplorer.merill.net)

## What is this?

Microsoft's [Zero Trust Workshop](https://zerotrust.microsoft.com/) is a wealth of knowledge on implementing Zero Trust using the Microsoft Security stack. It's designed to be used when running a series of workshops with a customer, walking through each pillar of the Zero Trust framework.

As a side effect of being a workshop tool, the depth of guidance it contains isn't always in an easily digestible form for someone who simply wants to learn. This site reorganizes that knowledge into an interactive knowledge tree that you can explore at your own pace — spanning identity, devices, data, network, infrastructure, security operations, and AI.

Whether you're a security architect, IT admin, or just curious about how Microsoft approaches Zero Trust, this site aims to make the concepts approachable and the guidance easy to navigate.

## Features

- **Overview dashboard** — Browse all 7 pillars with their functional areas and tasks in a card grid
- **Interactive mindmaps** — Explore each pillar as a zoomable, pannable mindmap
- **Zero Trust Book** — A printable, long-form reference with chapters per pillar and PDF export
- **Auto-synced content** — Data stays current via daily automated sync from upstream sources

## Pillars

| Pillar | Description |
|---|---|
| Identity | Identity and access management |
| Devices | Device compliance and management |
| Data | Data protection and governance |
| Network | Network security and segmentation |
| Infrastructure | Application and infrastructure security |
| Security Operations | Threat detection, investigation, and response |
| AI | AI security posture, agent governance, and threat protection |

## How it's built

The site is a React app (TypeScript + Vite) that pulls its data directly from the upstream Zero Trust Workshop sources. No content is manually copied or maintained here — everything stays in sync automatically.

A daily automated sync runs via GitHub Actions every morning at 6 AM UTC. It fetches the latest pillar data from [zerotrust.microsoft.com](https://zerotrust.microsoft.com/) and pulls the workshop documentation (Markdown) from the [microsoft/zerotrustassessment](https://github.com/microsoft/zerotrustassessment) GitHub repository. When changes are detected upstream, they're committed to this repository automatically — keeping the content fresh without any manual intervention.

## Development

```bash
npm install
npm run dev
```

## Who built this?

This is a personal project by [Merill Fernando](https://merill.net), a Product Manager at Microsoft.

---

*This site is not a Microsoft product and is not affiliated with or endorsed by Microsoft.*
