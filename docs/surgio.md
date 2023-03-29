# The Surgio generate call chains

## 1. Entry

[bin/surgio.js#L7](https://github.com/surgioproject/surgio/blob/master/bin/surgio.js#L7)

```javascript
const d = new SurgioCommand();
d.start();
```

## 2. Generate Command

[lib/command/generate.ts#L40](https://github.com/surgioproject/surgio/blob/master/lib/command/generate.ts#L40)

```typescript
  public async run(ctx): Promise<void> {
    // load config from surgio.conf.js
    loadConfig(ctx.cwd, ctx.argv.config);
    // ...
    // generate conf file
    await generate(getConfig(), ctx.argv.skipFail, ctx.argv.cacheSnippet);
    // ...
  }
```

## 3. Generate class

[lib/generate.ts#L85](https://github.com/surgioproject/surgio/blob/master/lib/generate.ts#L85)

```typescript
export default async function (config: CommandConfig, skipFail?: boolean, cacheSnippet?: boolean): Promise<void> {
  // ...
  await run(config, skipFail, cacheSnippet);
  // ...
}
```

[lib/generate.ts#L16](https://github.com/surgioproject/surgio/blob/master/lib/generate.ts#L16)

```typescript
async function run(config: CommandConfig, skipFail?: boolean, cacheSnippet?: boolean): Promise<void> {
  // ...
  const artifactList: ReadonlyArray<ArtifactConfig> = config.artifacts;
  // ...
  const templateEngine = getEngine(config.templateDir);

  // ...
  for (const artifact of artifactList) {
    // ...

    try {
      const artifactInstance = new Artifact(config, artifact, {
        remoteSnippetList,
      });

      // ...

      await artifactInstance.init();

      const result = artifactInstance.render(templateEngine);
      // ...
    } catch (err) {}
  }
}
```
