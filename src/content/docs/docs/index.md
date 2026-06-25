---
title: Overview
description: Thumbrella documentation
---

Thumbrella is a server for generating online thumbnails. There are a collection
of client libraries that simplify advanced features like client side streaming
and caching.

Thumbrella aims to be a useful and lightweight. It is meant to be simple to run
for yourself. There are cheap hosted options that provide many compelling
features, but this is entirely optional. The primary focus is on developer
experience. No matter how you intend to use Thumbrella, getting started easily
is the focus.

The server itself is written in Rust. The project is open source and is designed
to be easily hostable. It supports rendering thumbnails for a wide variety of
media types. From simple jpeg images, all the way to 3d models with custom
shaders. The server can be run directly as a static executable on many operating
systems. This is extendable with optional external processes to handle the more
complicated media formats.

Thumbrella documentation is organized into sections tailored to different roles,
from application developers integrating a thumbnail client to platform
maintainers working on the internals.

### Clients

The [client](/docs/client/overview) section details accessing a Thumbrella
server. There are high level libraries for a variety of languages and
environemtns. The server is also intended to be easy to access directly over
HTTP.

### Server

The [server](/docs/server) section describes running your own server.
There are various convenient ways to download the server on any operating
system. Learn how to enable the various features, troubleshoot problems,  and
take your own server to production.

### Service

The [service](/docs/service) section describes interacting with the
public server. Resource limits, managing tokens, account administration, and
more.

### Development

The [development](/docs/development/overview) section goes deeper into the
project architecture. Discover how the main features are implemented. Explain
the development process, coding guidelines, and more. This also gives an
overview of the 
