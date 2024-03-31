from .walker1991 import Node, Walker1991


def test_left_cousin():
    o = Node(value="O")

    e = Node(value="E", parent=o)
    f = Node(value="F", parent=o)
    n = Node(value="N", parent=o)

    a = Node(value='A', parent=e)
    d = Node(value='D', parent=e)

    g = Node(value='G', parent=n)
    m = Node(value='M', parent=n)

    b = Node(value='B', parent=d)
    c = Node(value='C', parent=d)

    h = Node(value='H', parent=m)
    i = Node(value='I', parent=m)
    j = Node(value='J', parent=m)
    k = Node(value='K', parent=m)
    l = Node(value='L', parent=m)

    Walker1991().tree_position(o)

    assert o.left_cousin is None
    assert e.left_cousin is None
    assert a.left_cousin is None
    assert b.left_cousin is None
    assert f.left_cousin == e
    assert n.left_cousin == f
    assert d.left_cousin == a
    assert g.left_cousin == d
    assert m.left_cousin == g
    assert c.left_cousin == b
    assert h.left_cousin == c
    assert i.left_cousin == h
    assert j.left_cousin == i
    assert k.left_cousin == j
    assert l.left_cousin == k


def test_y():
    o = Node(value="O")

    e = Node(value="E", parent=o)
    f = Node(value="F", parent=o)
    n = Node(value="N", parent=o)

    a = Node(value='A', parent=e)
    d = Node(value='D', parent=e)

    g = Node(value='G', parent=n)
    m = Node(value='M', parent=n)

    b = Node(value='B', parent=d)
    c = Node(value='C', parent=d)

    h = Node(value='H', parent=m)
    i = Node(value='I', parent=m)
    j = Node(value='J', parent=m)
    k = Node(value='K', parent=m)
    l = Node(value='L', parent=m)

    Walker1991(node_height=10, level_separation=5, min_y=20).tree_position(o)

    assert o.y == 20
    assert e.y == f.y == n.y == 35
    assert a.y == d.y == g.y == m.y == 20 + 30
    assert b.y == c.y == h.y == i.y == j.y == k.y == l.y == 20 + 45


def test_x():
    o = Node(value="O")

    e = Node(value="E", parent=o)
    f = Node(value="F", parent=o)
    n = Node(value="N", parent=o)

    a = Node(value='A', parent=e)
    d = Node(value='D', parent=e)

    g = Node(value='G', parent=n)
    m = Node(value='M', parent=n)

    b = Node(value='B', parent=d)
    c = Node(value='C', parent=d)

    h = Node(value='H', parent=m)
    i = Node(value='I', parent=m)
    j = Node(value='J', parent=m)
    k = Node(value='K', parent=m)
    l = Node(value='L', parent=m)

    Walker1991(node_height=10, level_separation=5, min_y=20).tree_position(o)

    assert o.x == 13.5
    assert e.x == 3
    assert a.x == 0
    assert d.x == 6
    assert b.x == 3
    assert c.x == 9
    assert f.x == 13.5
    assert n.x == 24
    assert g.x == 21
    assert m.x == 27
    assert h.x == 15
    assert i.x == 21
    assert j.x == 27
    assert k.x == 33
    assert l.x == 39


'''
O     13.5
E     3 + 0 = 3
A     0 + 0 + 0 = 0
D     6 + 0 + 0 = 6
B     0 + 3 + 0 + 0 = 3
C     6 + 3 + 0 + 0 = 9
F     13.5 + 0 = 13.5
N     24 + 0 = 24
G     0 + 21 + 0 = 21
M     6 + 21 + 0 = 27
H     0 + -6 + 21 + 0 = 15
I     6 + -6 + 21 + 0 = 21
J     12 + -6 + 21 + 0 = 27
K     18 + -6 + 21 + 0 = 33
L     24 + -6 + 21 + 0 = 39'''
