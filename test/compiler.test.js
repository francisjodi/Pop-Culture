import assert from "assert/strict"
import util from "util"
import compile from "../src/compiler.js"

const sampleProgram = "print 0;"

describe("The Compiler", () => {
  it("throws when the output type is unknown", (done) => {
    assert.throws(() => compile(sampleProgram, ""), /Unknown output type/)
    done()
  })

  it("accepts the ast option", (done) => {
    const compiled = compile(sampleProgram, "ast")
    assert(util.format(compiled).startsWith("   1 | Program"))
    done()
  })

})
