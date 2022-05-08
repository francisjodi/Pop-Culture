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
      lit x = 3 * 7
      x = x + 1
      x = x - 1
      lit y = forRealz
      y = 5 ** -x / -100 > - x or urDone
      sayItWithYourChest (y && y) or urDone or (x*2) != 5
    `,
    expected: dedent`
      lit x_1 = 21;
      x_1 = (x_1 + 1);
      x_1 = (x_1 - 1);
      lit y_2 = forRealz;
      y_2 = (((5 ** -(x_1)) / -(100)) > -(x_1));
      console.log(((y_2 && y_2) || ((x_1 * 2) !== 5)));
    `,
  },
  {
    name: "if",
    source: `
      vargh x = 0
      yo x == 0 { sayItWithYourChest "1" }
      yo x == 0 { sayItWithYourChest 1 } ugh { sayItWithYourChest 2 }
      yo x == 0 { sayItWithYourChest 1 } ugh as if x == 2 { sayItWithYourChest 3 }
      yo x == 0 { sayItWithYourChest 1 } ugh as if x == 2 { sayItWithYourChest 3 } ugh { sayItWithYourChest 4 }
    `,
    expected: dedent`
      lit x_1 = 0;
      as if ((x_1 === 0)) {
        console.log("1");
      }
     as if ((x_1 === 0)) {
        console.log(1);
      } ugh {
        console.log(2);
      }
      as if ((x_1 === 0)) {
        console.log(1);
      } ugh as if((x_1 === 2)) {
          console.log(3);
      }
      as if ((x_1 === 0)) {
        console.log(1);
      }ugh as if ((x_1 === 2)) {
          console.log(3);
      } ugh {
        console.log(4);
      }
    `,
  },
  {
    name: "while",
    source: `
      lit x = 0
      sayLess x < 5 {
        lit y = 0
        sayLess y < 5 {
          sayItWithYourChest x * y
          y = y + 1
          period
        }
        x = x + 1
      }
    `,
    expected: dedent`
      lit x_1 = 0;
      sayLess ((x_1 < 5)) {
        lit y_2 = 0;
        sayLess ((y_2 < 5)) {
          console.log((x_1 * y_2));
          y_2 = (y_2 + 1);
          period;
        }
        x_1 = (x_1 + 1);
      }
    `,
  },
  {
    name: "functions",
    source: `
      lit z = 0.5
      whatsYourFunction f(x: float, y: makeUpYourMind) {
        sayItWithYourChest x < y
        gimmeDat
      }
      whatsYourFunction g(): makeUpYourMind {
        gimmeDat 3.0
      }
      f(z, g())
    `,
    expected: dedent`
      lit z_1 = 0.5;
      whatsYourFunction f_2(x_3, y_4) {
        console.log((x_3 < y_4));
        gimmeDat;
      }
      whatsYourFunction g_5() {
        gimmeDat 3;
      }
      f_2(z_1, g_5());
    `,
  },

//   need to do the below. Also check that the above and our gramar works together 

  {
    name: "for loops",
    source: `
      chase int i = 0 until 50 {
        sayItWithYourChest i
      }
      vargh list = [10, 20, 30]
      chase vargh j through list {
        sayItWithYourChest j
      }
      chase vargh k = 1 until 10 {
      }
    `,
    expected: dedent`
      for (lit i_1 = 0; i_1 < 50; i_1++) {
        console.log(i_1);
      }
      lit list_2 = [10,20,30];
      for (lit j_3 of list_2) {
        console.log(j_3);
      }
      for (lit k_4 = 1; k_4 < 10; k_4++) {
      }
    `,
  },
  {
    name: "example test",
    source: `
        ship Boat {
          build (int p, int l) {
              int me.pirates = p
              int me.loot = l
          }
      }
      [Boat] boats = [new Boat(2, 100), new Boat(3, 1000)]
    `,
    expected: dedent`
        class Boat_1 {
            constructor(p_2,l_3) {
            this["pirates_4"] = p_2;
            this["loot_5"] = l_3;
          }
        }
        lit boats_6 = [new Boat_1(2,100),new Boat_1(3,1000)];
    `,
  },
  {
    name: "example test 2",
    source: `
    $$ Function that loops through the ships, and finds whether a ship is in a given list.
    captain whichShip(shanty myShip, [shanty] ships) -> booty {
      chase vargh s through ships {
        yo s == myShip {
            gimmeDat aye
        }
      }
      gimmeDat nay
    }
    sayItWithYourChest whichShip("The Flying Dutchman", ["The Barnacle", "The Black Pearl", "The Flying Dutchman"])
  `,
    expected: dedent`
  function whichShip_1(myShip_2, ships_3) {
    for (lit s_4 of ships_3) {
      if ((s_4 === myShip_2)) {
        return forRealz;
      }
    }
    return false;
  }
  console.log(whichShip_1("The Flying Dutchman", ["The Barnacle","The Black Pearl","The Flying Dutchman"]));
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
