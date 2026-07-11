# Claude Project Guide

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:

- Product ideas/brainstorming → invoke `/office-hours`
- Strategy/scope → invoke `/plan-ceo-review`
- Architecture → invoke `/plan-eng-review`
- Design system/plan review → invoke `/design-consultation` or `/plan-design-review`
- Full review pipeline → invoke `/autoplan`
- Bugs/errors → invoke `/investigate`
- QA/testing site behavior → invoke `/qa` or `/qa-only`
- Code review/diff check → invoke `/review`
- Visual polish → invoke `/design-review`
- Ship/deploy/PR → invoke `/ship` or `/land-and-deploy`
- Save progress → invoke `/context-save`
- Resume context → invoke `/context-restore`
- Author a backlog-ready spec/issue → invoke `/spec`

## Testing

- Run `npm run build` after changing source pages, partials, CSS, JavaScript, or hashed assets.
- Run `npm run test:unit` for renderer, validation, analytics, and attribution changes.
- Run `npm run test:e2e` for navigation, layout, accessibility, or interaction changes.
- Run `npm test` before handoff. It includes generated-output and performance checks.
- Add a regression test with every bug fix when practical.
- See `TESTING.md` for production smoke and browser setup.
