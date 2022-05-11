import assert from "assert/strict"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"
function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}
const fixtures = [
  {
    name: "smaller",
    source: `
      sayItWithYourChest "hello world";
    `,
    expected: dedent`
      console.log("hello world");
    `,
  },
  {
    name: "variable assignment",
    source: `
        lit x = 5;
        lit y = 1;
         y = x;
        sayItWithYourChest y;
    `,
    expected: dedent`
        let x = 5;
        let y = 1;
        y = x;
        console.log(1);
    `,
  },
  // {
  //   name: "function",
  //   source: `
  //   lit x = 5;
  //   lit y = 3;
  //   whatsYourFunction f(x,y);{;
  //     sayItWithYourChest x;
  //     gimmeDat x;
  //   }
  //   `,
  //   expected: dedent`

  //     function f_2(x_3, y_4) {
  //       console.log(x);
  //       return;
  //     }
  //     function g_5() {
  //       return false;
  //     }
  //   `,
  // },
  {
    name: "if",
    source: `
    lit x = 0;
    as if x > 5{
      gimmeDat 1;
    }
    ugh as if x < 5{gimmeDat 2;}
    ugh {gimmeDat 0;}
    `,
    expected: dedent`
      let x = 0;
      if ((x > 5)) {
        console.log(1);
      } else if {
        console.log(2);{
        }else {
          console.log(0);
        }
      }
    `,
  },
]
describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(ast(fixture.source))))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})
