var stx = require("./../sol/stx.js");
var sol = require("./../sol/sol.js");
var sb = require("./solarbase.js")();

sb.book(`

Nat, the type of natural numbers
  Nat:*
  (: (:Nat Nat) (:Nat Nat))

n0, the natural number 0
  Nat: *
  suc: :Nat Nat
  zer: Nat
  zer

suc, the natural number successor
  val: Nat
  Nat: *
  suc: :Nat Nat
  zer: Nat
  (suc (val Nat suc zer))

add, the sum of two natural numbers
  n: Nat
  m: Nat
  Nat: *
  suc: :Nat Nat
  zer: Nat
  (n Nat suc (m Nat suc zer))

mul, the product of two natural numbers
  n: Nat
  m: Nat
  Nat: *
  suc: :Nat Nat
  (n Nat (m Nat suc))

exp, the power of two natural numbers
  n: Nat
  m: Nat
  Nat: *
  (n (: Nat Nat) (m Nat))

min
  a: Nat
  b: Nat
  Nat: *
  succ: (:Nat Nat)
  zero: Nat
  (A:*
    ((a (:A Nat) (p:(: A Nat) k:A (k p)) (k:A zero))
     (b (:A Nat) (p:(: A Nat) k:A (succ (k p))) (k:A zero)))
     r.(: r Nat))

n1, the natural number 1
  (suc n0)

n2, the natural number 2
  (suc n1)

n3, the natural number 3
  (suc n2)

n4, the natural number 4
  (suc n3)

n5, the natural number 5
  (suc n4)

n6, the natural number 6
  (suc n5)

n7, the natural number 7
  (suc n6)

n8, the natural number 8
  (suc n7)

n9, the natural number 9
  (suc n8)

Pair, the type of pairs
  t:*
  u:*
  Pair:*
  (: (:t (:u Pair)) Pair)

pair, the pair constructor
  t:*
  u:*
  a:t
  b:u
  Pair:*
  pair:(:t (:u Pair))
  (pair a b)

List, the type of lists
  t:*
  List:*
  cons:(: t (: List List))
  nil:List
  List

cons
  t: *
  head: t
  tail: (List t)
  List: *
  cons: (:t (:List List))
  nil: List
  (cons head (tail List cons nil))

nil
  t: *
  List: *
  cons:(: t (:List List))
  nil:List
  nil

l123
  (cons Nat n1 (cons Nat n2 (cons Nat n3 (nil Nat))))

f123
  (a:* (b:(:# (:a a)) (a:a (b 1 (b 2 (b 3 a))))))

addf
  (x:# y:# {0 x y})

zipWith
  u: *
  f: (:u (: u u))
  a: (List u)
  b: (List u)
  List: *
  cons: (:u (:List List))
  nil: List
  (B:*
    (a (: B List)
      (h:u t:(: B List) k:B (k t h))
      (k:B nil)
    (b B
      (x:u t:B k:(: B List) y:u (cons (f x y) (k t)))
      (k:(: B List) x:u nil)))
    r.(: (: r List) (: u List)))

.test, a test program
  (zipWith # addf f123 f123)

`);

sb.print(".test", true);
