import ast from "./ast.js"

export default function compile(source, outputType) {
  if (![ast].includes(outputType)) {
    throw new Error("Unknown output type")
  }
  const program = ast(source)
  if (outputType === "ast") return program
}
