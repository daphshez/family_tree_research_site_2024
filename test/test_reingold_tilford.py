from familyresearch.reingold_tilford import Node, ReingoldTilford


def test():
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

    ReingoldTilford().calculate_node_positions(o)

    assert o.y == 0
    assert e.y == f.y == n.y == 1
    assert a.y == d.y == g.y == m.y == 2
    assert b.y == c.y == h.y == i.y == j.y == k.y == l.y == 3

    assert a.x == 0
    assert b.x == 0.5
    assert e.x == 0.5
    assert d.x == 1
    assert c.x == 1.5
    assert f.x == 2.25
    assert o.x == 2.25
    assert h.x == 2.5
    assert g.x == 3.5
    assert i.x == 3.5
    assert n.x == 4
    assert j.x == 4.5
    assert m.x == 4.5
    assert k.x == 5.5
    assert l.x == 6.5


def test_right_child_has_many_more_children():
    a = Node(value='A')
    b = Node(value='B', parent=a)
    c = Node(value='C', parent=a)
    c_children = [Node(value=v, parent=c) for v in "DEFGH"]

    ReingoldTilford(node_size=10, sibling_distance=2, tree_distance=4).calculate_node_positions(a)

    assert a.y == 0
    assert b.y == c.y == 1
    assert [child.y == 2 for child in c_children]

    assert c_children[0].x == 0
    assert c_children[1].x == 12
    assert c_children[2].x == 24
    assert c_children[3].x == 36
    assert c_children[4].x == 48
    assert c.x == 24
    assert b.x == 10
    assert a.x == 17