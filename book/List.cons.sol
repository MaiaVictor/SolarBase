t: *
head: t
tail: (List t)
List: *
cons: (:t (:List List))
nil: List
(cons head (tail List cons nil))
