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
    name: "small",
    source: `
      lit x = 3 * 7;
      x = x + 1;
      x = x - 1;
      lit y = forRealz;
      y = 5 ** -x / -100 > - x || urDone;
      sayItWithYourChest (y && y) || urDone || (x*2) != 5;
    `,
    expected: dedent`
      let x_1 = 21;
      x_1 = x_1 + 1;
      x_1 = x_1 - 1;
      let y_2 = true;
      y_2 = (((5 ** -(x_1)) / -(100)) > -(x_1));
      console.log(((y_2 && y_2) || ((x_1 * 2) !== 5)));
    `,
  },
  {
    name: "if",
    source: `
        lit x = 0;
        as if x == 0 { sayItWithYourChest "1" ;}
        as if x == 0 { sayItWithYourChest 1 ;} ugh { sayItWithYourChest 2 ;}
        as if x == 0 { sayItWithYourChest 1 ;} ugh as if x == 2 { sayItWithYourChest 3 ;}
        as if x == 0 { sayItWithYourChest 1 ;} ugh as if x == 2 { sayItWithYourChest 3 ;} ugh { sayItWithYourChest 4 ;}
      `,
    expected: dedent`
  let x_1 = 0;
      if ((x_1 === 0)) {
        console.log("1");
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else {
        console.log(2);
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else if ((x_1 === 2)) {
          console.log(3);
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else if ((x_1 === 2)) {
          console.log(3);
      } else {
        console.log(4);
      }
    `,
  },
  {
    name: "while",
    source: `
        lit x = 0;
        sayLess x < 5 {
          lit y = 0;
          sayLess y < 5{
            sayItWithYourChest(x * y);
            y = y + 1;
            period;
          }
          x = x + 1;
        }
      `,
    expected: dedent`
        let x_1 = 0;
      while ((x_1 < 5)) {
        let y_2 = 0;
        while ((y_2 < 5)) {
          console.log((x_1 * y_2));
          y_2 = (y_2 + 1);
          break;
        }
        x_1 = (x_1 + 1);
      }
    `,
  },
  {
    name: "functions",
    source: `
      lit z = 5;
      whatsYourFunction f(x, y){
        sayItWithYourChest( x < y);
        gimmeDat;
      }
      ;whatsYourFunction g(){
        gimmeDat 3;
      }
      ;f(z, g);
    `,
    expected: dedent`
       let z_1 = 0.5;
      function f_2(x_3, y_4) {
        console.log((x_3 < y_4));
        return;
      }
      function g_5() {
        return 3;
      }
      f_2(z_1, g_5());
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
