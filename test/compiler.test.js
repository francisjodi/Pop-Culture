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

  // describe("has a times function", () => {
  //     it("should return 4 when multiplying 2 and 2 ", () => {
  //       assert.deepEqual(times(2, 2), 4)
  //     })
  //     it("returns 0 when multipling by 0 ", () => {
  //       assert.deepEqual(times(2,0),0)
  //       assert.deepEqual(times(0,98765456789),0)
  //       assert.deepEqual(times(0,0),0)
  //     })
  //   })
})
