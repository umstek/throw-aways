function isTemplateStringsArray(obj?: unknown): obj is TemplateStringsArray {
  return Array.isArray(obj) && "raw" in obj && Array.isArray(obj.raw);
}

export function message(role: "system" | "user" | "assistant" | "function") {
  function optHOF(message: TemplateStringsArray): {
    role: "system" | "user" | "assistant" | "function";
    content: string;
  };
  function optHOF(name: string): (message: TemplateStringsArray) => {
    role: "system" | "user" | "assistant" | "function";
    name: string;
    content: string;
  };
  function optHOF(nameOrMessage: string | TemplateStringsArray) {
    if (isTemplateStringsArray(nameOrMessage)) {
      return {
        role,
        content: nameOrMessage.join("\n"),
      };
    } else if (typeof nameOrMessage === "string") {
      return (message: TemplateStringsArray) => {
        return {
          role,
          name: nameOrMessage,
          content: message.join("\n"),
        };
      };
    } else {
      throw new Error("Invalid argument type.");
    }
  }

  return optHOF;
}

const system = message("system");

const x = system`Hello!`;
const y = system("os")`Hello from os!`;
