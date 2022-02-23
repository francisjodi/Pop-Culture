import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"


const syntaxChecks = [

]

const syntaxErrors = [

]

describe("The grammar", () => {
    const grammar = ohm.grammar(fs.readFileSync("src/popCulture.ohm"))
    for (const [scenario, source] of syntaxChecks) {
        it(`properly specifies ${scenario}`, () => {
            assert(grammar.match(source).succeeded())
        })
    }

    for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
        it(`does not permit ${scenario}`, () => {
            const match = grammar.match(source)
            assert(!match.succeeded())
            assert(new RegExp(errorMessagePattern).test(match.message))
        })
    }
})



