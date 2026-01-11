# Cricket Platform Monorepo

Monorepo scaffold for the Cricket Platform.

Structure:

- apps/ - application packages
- libs/ - shared libraries
- infra/ - infra-as-code, deployment manifests
- scripts/ - helper scripts for bootstrapping and tooling
- docs/ - documentation

This repo uses npm workspaces. To install dependencies run:

```bash
cd E:\My-Projects\cricket-platform
npm install
```

To run a workspace script, use `npm run` from the workspace package or `npm -w <workspace> run <script>`.
