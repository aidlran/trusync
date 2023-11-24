export class CircularDependencyError extends Error {
  constructor(
    readonly targetModuleID: string,
    readonly dependencySet: Readonly<Set<string>>,
  ) {
    super(`Circular dependency detected while providing ${targetModuleID}.`);
  }
}
