# Local Spec Kit planning workspace

This project uses the templates and PowerShell scripts from the sibling
`../spec-kit/` checkout, revision `d848fb4e`, to plan application upgrades.
This is a local, template-based adoption; the Specify CLI and agent slash commands
have not been installed. The toolkit repository is unchanged.

The copied templates in `templates/` come from that checkout. Its license is at
`../spec-kit/LICENSE`. Project principles are in `memory/constitution.md`.
`feature.json` selects the active specification independently of Git branches.
The application remains on `main`; no commit or stash was made.

Start with [the roadmap](../specs/roadmap.md), then
[the first implementation plan](../specs/001-news-discovery/plan.md).

From `AI-updates/`, validate the planning artifacts using the local toolkit:

```powershell
& ../spec-kit/scripts/powershell/check-prerequisites.ps1 -Json -RequireSpec -RequireTasks -IncludeTasks
```

For later features, use the same local `create-new-feature.ps1`, `setup-plan.ps1`,
and `setup-tasks.ps1` scripts, then fill their templates. Create later feature
specifications when that release is selected. Keep specification, design,
tasks, and verification notes consistent as implementation discoveries occur.

No extensions or extension hooks are configured. This planning workspace does
not implement the application features described in the specifications.
