import assert from "assert/strict"
import util from "util"
import compile from "../src/compiler.js"

const sampleProgram = "sayItWithYourChest(0);"

describe("The compiler", () => {
  it("throws when the output type is unknown", done => {
    assert.throws(() => compile(sampleProgram, "blah"), /Unknown output type/)
    done()
  })
  it("accepts the ast option", done => {
    const compiled = compile(sampleProgram, "ast")
    assert(util.format(compiled).startsWith("   1 | Program"))
    done()
  })
})
