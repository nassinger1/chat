export interface ICommandHandler<Command, Result> {
  execute(command: Command): Promise<Result>;
}
