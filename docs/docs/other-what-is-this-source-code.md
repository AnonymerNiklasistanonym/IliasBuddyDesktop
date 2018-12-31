# What is this source code

## `cloc`

1. Install it via `npm install cloc` or via [GitHub releases](https://github.com/AlDanial/cloc/releases)
2. Run `cloc --vcs=git` to see all the files and lines of code that are tracked via this `git` repository
3. Or check especially for a programming language with `cloc --vcs=git --include-lang=JavaScript` (For other languages replace *JavaScript* or if you want to view more than one add them with a comma like `cloc --vcs=git --include-lang=JavaScript,TypeScript`)

(*Example preview from 20.12.2018*)

```sh
$ cloc --vcs=git
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
JavaScript                      16            147            564           1297
CSS                              6             67             52            357
JSON                             2              0              0            286
TypeScript                      10             21              0            279
HTML                             1              4              5             78
Handlebars                      14              4              0             71
Bourne Shell                     8             17             14             53
Markdown                         3             27              0             48
-------------------------------------------------------------------------------
SUM:                            60            287            635           2469
-------------------------------------------------------------------------------
```

(*Example preview from 31.12.2018*)

```sh
$ cloc --vcs=git
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
JavaScript                      19            216           1121           2034
JSON                             6              0              0            497
CSS                              6             73             55            384
TypeScript                       9             47            701            341
Markdown                        14            114              0            241
Bourne Shell                    14             48             32            128
HTML                             1              4             13            126
Handlebars                      17              5              3             90
YAML                             1              4              3             36
PowerShell                       1              1              3              4
-------------------------------------------------------------------------------
SUM:                            88            512           1931           3881
-------------------------------------------------------------------------------
```

## Get the most used lines

If you want to see what the most used constructs/calls are use the following command:

(*Example preview from 20.12.2018*)

```sh
$ find -iname '*.js' -not -path "./node_modules/*" -not -path "./dist/*" | xargs cat | sort | uniq -c | sort -nr | head -n 5
    146
     80   }
     56   /**
     56    */
     41     }
```

(*Example preview from 31.12.2018*)

```sh
$ find -iname '*.js' -not -path "./node_modules/*" -not -path "./dist/*" | xargs cat | sort | uniq -c | sort -nr | head -n 5
    216
    109   }
     82   /**
     82    */
     77  */
```

Because the first some lines are always not that necessary (Whitespaces, parentheses, brackets, ...) just play around and probably add a tail to start off from the nth line:

(*Example preview from 20.12.2018*)

```sh
$ find -iname '*.js' -not -path "./node_modules/*" -not -path "./dist/*" | xargs cat | sort | uniq -c | sort -nr | head -n 21 |tail -n +14
     10 const path = require('path')
     10    * @returns {string}
      8      */
      7       })
      7       break
      7         })
      6 })
      6 const fs = require('fs')
```
