---
title: "Connecting Claude to Your Homelab with MCP and Tailscale SSH"
date: 2026-05-05
post_image: /assets/images/blog/connecting-claude-to-your-homelab-with-mcp-and-tailscale-ssh.webp
permalink: /connecting-claude-to-your-homelab-with-mcp-and-tailscale-ssh/
author: "Randy Walker"
categories: [building, ai]
tags: [claude, mcp, tailscale, ssh, homelab, comfyui, image-generation]
meta_title: "Claude + SSH over MCP: A Homelab MCP Server with Tailscale"
meta_description: "Give Claude SSH access to your homelab with an MCP server over Tailscale — bash, browser automation, and unlimited local ComfyUI image generation. Includes the Windows SSH gotcha that cost me an evening."
---

One of the more useful things I've done with my homelab recently is wiring it directly into Claude via MCP. Bash execution, browser automation, image generation — all available as tools Claude can reach for mid-conversation, running on real hardware sitting on my desk.

Here's the full setup, how it fits together, and the one thing that will save you an afternoon if you're on Windows.

## The Basic Idea

Two machines. One Windows desktop where Claude runs. One Linux machine — in my case a ThinkPad with a dedicated NVIDIA GPU — that does the actual work.

Claude connects to the Linux machine over SSH, starts a small server process, and from that point on it can run bash commands, control a browser, generate images, or do anything else you wire up. The connection is lightweight, there's nothing to maintain between sessions, and it works the same whether the Linux machine is sitting next to you or across the house.

## Why Tailscale

Managing SSH keys across machines is tedious. Tailscale SSH sidesteps it entirely.

Once both machines are on a Tailscale network and Tailscale SSH is enabled on the Linux side, connecting is just `ssh user@your-machine.your-tailnet.ts.net` — no keys, no agent, no host verification dance. Tailscale handles authentication using the identity it already knows about.

This turns out to be important for Claude specifically, because Claude's processes don't have easy access to your SSH keys or agent. Tailscale removes that dependency completely.

## The Architecture

The transport is SSH stdio — Claude spawns an SSH process, which connects to the Linux machine and starts an MCP server. JSON-RPC flows back and forth over stdin and stdout. When the conversation ends, the connection closes and the process exits.

No middleman process running on the Windows side. No port forwarding. No proxy to monitor. Just SSH doing what it does.

On the Linux side, each MCP server runs as a systemd service so it's ready when Claude needs it. Three servers in my setup:

- **Bash** — runs shell commands on the Linux machine as a regular user with passwordless sudo available for anything that needs it
- **Browser** — a Playwright server running in Docker, giving Claude a full Chromium browser to navigate and interact with
- **Image generation** — bridges to ComfyUI running on the local NVIDIA GPU

## The GPU Angle: Free Image Generation, No Limits

This one deserves its own moment.

Most AI image generation today runs through APIs — you pay per image, or you hit monthly usage limits, or both. DALL-E, Midjourney, Stability — they all work this way. Fine for occasional use. Less fine when you're building something and generating dozens of images a session.

Running ComfyUI locally on an NVIDIA GPU changes that math entirely. The hardware cost is a one-time sunk cost. After that, generation is free. No per-image fees, no monthly cap, no waiting in a queue behind other users. Claude asks for an image, the GPU generates it, done.

The quality is competitive with the paid APIs for most practical uses. The speed depends on your GPU, but on a mid-range NVIDIA card you're looking at 10-30 seconds per image — fast enough that it doesn't feel like waiting.

The MCP server bridges Claude to ComfyUI over its local API. Claude describes what it wants, the server sends a workflow to ComfyUI, the GPU runs it, and the result comes back. From Claude's perspective it's just a tool call. From my perspective it's image generation I stopped paying for.

## Setting It Up on Windows

Claude Desktop on Windows is distributed as a sandboxed app package. That sandbox restricts what the app can access — and it turns out the SSH client that ships with Windows doesn't work correctly when launched from inside it. It exits silently with no error output.

The fix is straightforward: use the SSH client that comes bundled with Git for Windows instead. It works correctly in the same context where the Windows-native one fails.

If you have Git for Windows installed, you have it at:
```
C:\Program Files\Git\usr\bin\ssh.exe
```

That's the only change from what you might expect. Everything else is standard SSH.

## The Config

Claude Desktop reads its MCP server configuration from a JSON file. On Windows, that file lives at:

```
C:\Users\<you>\AppData\Local\Packages\Claude_<id>\LocalCache\Roaming\Claude\claude_desktop_config.json
```

Here's the pattern for each server entry:

```json
{
  "mcpServers": {
    "bash": {
      "command": "C:\\Program Files\\Git\\usr\\bin\\ssh.exe",
      "args": [
        "-T",
        "-o", "BatchMode=yes",
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=NUL",
        "-o", "PreferredAuthentications=none",
        "-o", "ConnectTimeout=30",
        "-o", "ServerAliveInterval=60",
        "user@your-machine.your-tailnet.ts.net",
        "/opt/your-bash-server/venv/bin/python3 /opt/your-bash-server/server.py --stdio"
      ]
    },
    "browser": {
      "command": "C:\\Program Files\\Git\\usr\\bin\\ssh.exe",
      "args": [
        "-T",
        "-o", "BatchMode=yes",
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=NUL",
        "-o", "PreferredAuthentications=none",
        "-o", "ConnectTimeout=30",
        "-o", "ServerAliveInterval=60",
        "user@your-machine.your-tailnet.ts.net",
        "docker run --rm -i your-playwright-image playwright-mcp --browser chromium --output-dir /tmp"
      ]
    },
    "image": {
      "command": "C:\\Program Files\\Git\\usr\\bin\\ssh.exe",
      "args": [
        "-T",
        "-o", "BatchMode=yes",
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=NUL",
        "-o", "PreferredAuthentications=none",
        "-o", "ConnectTimeout=30",
        "-o", "ServerAliveInterval=60",
        "user@your-machine.your-tailnet.ts.net",
        "/opt/your-image-server/venv/bin/python3 /opt/your-image-server/server.py --stdio"
      ]
    }
  }
}
```

What the SSH flags are doing:

- **`-T`** — no terminal. MCP needs clean stdin/stdout, not an interactive shell session.
- **`BatchMode=yes`** — no prompts. If SSH would normally pause and ask something, it fails immediately instead of hanging.
- **`UserKnownHostsFile=NUL`** — skips host key verification. Fine when both machines are on your own Tailscale network.
- **`PreferredAuthentications=none`** — tells SSH to use Tailscale's authentication. No key files or agents needed.
- **`ServerAliveInterval=60`** — keeps the connection alive between tool calls so it doesn't drop during a longer conversation.

## On the Linux Side

Each server runs as a systemd service. The pattern is simple:

```ini
[Unit]
Description=Bash MCP Server
After=network.target

[Service]
Type=simple
User=youruser
ExecStart=/opt/your-bash-server/venv/bin/python3 /opt/your-bash-server/server.py --stdio
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable it with `systemctl enable --now your-service-name` and it'll be running on boot, ready whenever Claude connects.

## Claude CLI Too

If you use Claude's command line tool, register the same servers there. The `--` before the SSH flags is important — it tells the Claude CLI that everything after it is an argument to pass through, not a flag for the CLI itself:

```powershell
claude mcp add bash "C:\Program Files\Git\usr\bin\ssh.exe" -- -T -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o PreferredAuthentications=none -o ConnectTimeout=30 -o ServerAliveInterval=60 user@your-machine.your-tailnet.ts.net "/opt/your-bash-server/venv/bin/python3 /opt/your-bash-server/server.py --stdio"
```

On the Linux machine itself, Claude CLI can talk to the servers directly without going through SSH:

```bash
claude mcp add bash /opt/your-bash-server/venv/bin/python3 -- /opt/your-bash-server/server.py --stdio
claude mcp add image /opt/your-image-server/venv/bin/python3 -- /opt/your-image-server/server.py --stdio
```

## What You End Up With

A Linux shell, a real browser, and unlimited local image generation — all available to Claude mid-conversation. The latency is low enough to be invisible on a local network. There's nothing to maintain between sessions on the Windows side. And if you have an NVIDIA GPU sitting in a machine that's already on, you're generating images for free, as many as you want, as fast as the hardware can run them.

The setup takes an hour or two to get right the first time. After that it just runs.

— Randy

---

*Next: what's actually worth running as an MCP server on homelab hardware, and a few things I've found useful that I didn't expect.*
