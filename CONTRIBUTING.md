# 🍇 Contributing to sNAKr

Thanks for being here.

sNAKr is open-source infrastructure for shared households. If you care about reducing waste, improving everyday life, or building human-first tech, you're in the right place.

---

## How to contribute

### Code contributions

**Good first issues**:
- Look for issues tagged `good-first-issue` or `help-wanted`
- Start small: bug fixes, docs improvements, test coverage

**Bigger features**:
- Check the roadmap in `docs/roadmap.md`
- Open an issue to discuss before building
- We prefer small, focused PRs over large rewrites

---

### Non-code contributions

**Documentation**:
- Improve clarity in specs or README
- Add examples or diagrams
- Fix typos or broken links

**Testing**:
- Write tests for uncovered code
- Test receipt parsing with real receipts
- Report bugs with clear reproduction steps

**Design and UX**:
- Suggest improvements to user flows
- Propose UI mockups (keep it calm and cozy)
- Review tone and voice in copy

**Community**:
- Answer questions in discussions
- Help new contributors get started
- Share sNAKr with people who might benefit

---

## Development setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for web app)
- Python 3.11+ (for API)
- PostgreSQL 15+ (or use Docker)

### Local setup

1. Clone the repo:
```bash
git clone https://github.com/sakialabs/snakr.git
cd snakr
```

2. Start services with Docker Compose:
```bash
docker-compose up
```

3. Run database migrations:
```bash
# TODO: Add migration command once implemented
```

4. Access the app:
- Web app: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs

---

## Code style

### Python (API)

- Use `black` for formatting
- Use `ruff` for linting
- Type hints required for all functions
- Docstrings for public functions

Run before committing:
```bash
black .
ruff check .
pytest
```

### TypeScript (Web app)

- Use Prettier for formatting
- Use ESLint for linting
- Prefer functional components and hooks
- Keep components small and focused

Run before committing:
```bash
npm run format
npm run lint
npm test
```

---

## Commit messages

Keep them clear and human:

**Good**:
- `Fix receipt parsing for Whole Foods receipts`
- `Add confidence threshold for predictions`
- `Update restock list urgency logic`

**Not great**:
- `fix bug`
- `WIP`
- `asdfasdf`

---

## Pull request process

1. **Fork the repo** and create a branch from `main`
2. **Make your changes** with clear commits
3. **Write tests** for new functionality
4. **Update docs** if you change behavior
5. **Open a PR** with a clear description:
   - What problem does this solve?
   - How did you test it?
   - Any breaking changes?

6. **Respond to feedback** (we're friendly, promise)
7. **Squash and merge** once approved

---

## Testing

### Unit tests

- Write tests for all new functions
- Aim for 80%+ coverage
- Use descriptive test names

**Python**:
```bash
pytest tests/
```

**TypeScript**:
```bash
npm test
```

### Integration tests

- Test API endpoints end-to-end
- Test receipt pipeline stages
- Test prediction accuracy

### Manual testing

- Test with real receipts from different stores
- Test on mobile and desktop
- Test with multiple household members

---

## Design principles

Keep these in mind when contributing:

1. **Human first**: Fuzzy states beat fake precision
2. **No shame**: No guilt, no nagging, no drama
3. **Household-safe**: No blame, no policing
4. **Explainable**: Predictions must have reason codes
5. **Local-first**: Resilience over "cheapest at any cost"
6. **Open-source**: Auditable, forkable, adaptable

See `docs/vision.md` for the full manifesto.

---

## Tone and voice

**In-app**: Playful, warm, a little cheeky.  
**Notifications**: Calm, minimal, factual.  
**Errors**: Respectful and helpful.

See `docs/tone.md` for detailed guidelines.

---

## Code of conduct

Be kind. Be respectful. Be constructive.

We're building for everyday people, not tech elites. Keep the vibe welcoming and inclusive.

**Not okay**:
- Harassment, discrimination, or hate speech
- Trolling or personal attacks
- Spam or self-promotion

**Okay**:
- Disagreeing respectfully
- Asking questions
- Making mistakes and learning

Violations will result in removal from the project.

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see `LICENSE`).

---

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Reach out to maintainers if you're stuck

---

Built with 💖 for everyday people tryna stay stocked and not get rocked.
