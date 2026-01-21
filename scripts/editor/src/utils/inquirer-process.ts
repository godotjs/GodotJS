import { ProgramOptionsType } from "../data";
import { input } from "@inquirer/prompts";

export const startInquirerProcess = async <T>(
  config: T,
  options: ProgramOptionsType[],
): Promise<T> => {
  const copyConfig: T = { ...config };

  const optionsWithInquirer = options.filter((option) => option.inquirer);

  for (const option of optionsWithInquirer) {
    const { inquirer } = option;
    if (
      inquirer?.input &&
      (!config[option.name] || config[option.name] === option.defaultValue)
    ) {
      copyConfig[option.name] = await input({
        message: inquirer.input.message,
        default: option.defaultValue?.toString(),
        required: option.required,
      });
    }
  }

  return copyConfig;
};
