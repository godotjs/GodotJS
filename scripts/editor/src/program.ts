import { Command, program } from "commander";
import { godotJS } from "./data";

export const getProgram = (name: string, description: string) => {
  const mProgram = program.name(name).description(description);

  for (const command of godotJS) {
    const pCommand = new Command(command.name);
    pCommand.description();

    if (command.description) {
      pCommand.description(command.description);
    }

    if (command.options) {
      for (const option of command.options) {
        const short: string | undefined =
          option.short &&
          (option.short?.startsWith("-") ? option.short : `-${option.short}`);

        const isBoolean = typeof option.defaultValue == "boolean";
        const pre = option.array
          ? "["
          : isBoolean
            ? ""
            : option.required
              ? "<"
              : "[";
        const post = option.array
          ? "s...]"
          : isBoolean
            ? ""
            : option.required
              ? ">"
              : "]";

        const long =
          option.long || `--${option.name} ${pre}${option.name}${post}`;

        pCommand.option(
          short ? `${short}, ${long}` : `${long}`,
          option.description || "",
          option.defaultValue,
        );
      }
    }

    pCommand.action(command.action);
    mProgram.addCommand(pCommand);
  }

  return mProgram;
};

export const startProgram = (name: string, description: string) => {
  getProgram(name, description).parse();
};
