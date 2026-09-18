# Stage 3 AI Provider Integration

## Scope
- Add provider-independent AI contracts with mock and OpenAI-compatible implementations.
- Validate research and listing responses with Zod and retry one malformed response.
- Run AI adapters through existing Task lifecycle and persist structured results.
- Add unit tests with fake providers and keep UI unchanged except failure feedback.

## Steps
1. Add schemas, provider config, prompts, concrete providers, and adapters using TDD.
2. Extend Prisma/domain research records and services to persist validated output.
3. Add API-safe failure handling, environment documentation, and smoke assertions.
4. Run test, typecheck, lint, Prisma validation, build, and commit.
