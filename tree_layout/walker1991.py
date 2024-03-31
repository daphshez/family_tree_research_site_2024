# http://www.pennelynn.com/Documents/CUJ/HTML/91HTML/19910056.HTM

import math
from typing import Optional


class Node:
    def __init__(self, value, width=2, parent: Optional["Node"] = None):
        self.val = value
        self.width = width

        # Tree structure
        # This assumes sibling nodes are constructed in the order we want to see them in the tree
        self.parent: Optional["Node"] = parent
        self.level: int = parent.level + 1 if parent is not None else 0
        self.children = []
        self.left_sibling = None
        self.right_sibling = None
        if self.parent:
            if len(self.parent.children) > 0:
                self.left_sibling = self.parent.children[-1]
                self.left_sibling.right_sibling = self
            self.parent.children.append(self)

        # this represents the previous cousin at the same level (depth) of the tree; this could be a sibling, a first
        # cousin or a remote cousin. This is built in the `InitPrevNodeAtLevel` call.
        # this is needed to check and avoid overlaps between subtrees.
        self.left_cousin: Optional["Node"] = None

        # Location parameters; at the end of the tree_position call those will represent top and left of the
        # node (assuming "north" orientation)
        self.x = None
        self.y = None
        # Internal parameters used to calculate the location
        self.prelim = None
        self.modifier = None

    def is_leaf(self):
        return len(self.children) == 0

    def has_left_sibling(self):
        return self.left_sibling is not None

    def has_right_sibling(self):
        return self.right_sibling is not None

    @property
    def first_child(self) -> Optional["Node"]:
        if self.is_leaf():
            return None
        return self.children[0]

    @property
    def last_child(self) -> Optional["Node"]:
        if self.is_leaf():
            return None
        return self.children[-1]

    def __repr__(self):
        return self.val


class Walker1991:
    def __init__(self,
                 sibling_separation=4,
                 maximum_depth=math.inf,
                 root_orientation='NORTH',
                 subtree_separation=4,
                 node_height=2,
                 level_separation=1,
                 min_x=0,
                 min_y=0):
        self.sibling_separation = sibling_separation
        self.maximum_depth = maximum_depth
        self.mean_width = 0
        self.root_orientation = root_orientation
        self.subtree_separation = subtree_separation
        self.node_height = node_height
        self.level_separation = level_separation
        self.min_x = min_x
        self.min_y = min_y
        self.last_node_at_level = {}

    def tree_position(self, apex: Node):
        # Determine the coordinates for each node in a tree.
        # Input: Pointer to the apex node of the tree
        self.last_node_at_level.clear()

        self.tree_first_walk(apex)

        self.tree_second_walk(apex)

        if self.root_orientation in ('NORTH', 'SOUTH'):
            self.fix_min_x(apex)
        else:
            self.fix_min_y(apex)

    def tree_first_walk(self, node: Node, level: int = 0):
        # Clean up old values in a node's flModifier
        node.modifier = 0

        # we build the left cousin pointers on the fly
        node.left_cousin = self.last_node_at_level.get(level)
        self.last_node_at_level[level] = node

        #  In a first post-order walk, every node of the tree is assigned a preliminary x-coordinate (node.prelim).
        #  In addition, internal nodes are given modifiers, which will be used to move their children to the right
        #  (node.modifier).
        if node.is_leaf() or level == self.maximum_depth:
            if node.has_left_sibling():
                # Determine the preliminary x-coordinate based on:
                # - preliminary x-coordinate of left sibling,
                # - the separation between sibling nodes, and
                # - mean width of left sibling & current node.

                #  Set the mean width of these two nodes
                self.tree_mean_node_size(node.left_sibling, node)

                node.prelim = node.left_sibling.prelim + self.sibling_separation + self.mean_width
            else:
                node.prelim = 0
        else:
            #  Position the leftmost of the children
            for child in node.children:
                self.tree_first_walk(child, level + 1)

            #  Calculate the preliminary value between  the children at the far left and right
            midpoint = (node.first_child.prelim + node.last_child.prelim) / 2

            # Set global mean width of these two nodes
            self.tree_mean_node_size(node.left_sibling, node)

            if node.has_left_sibling():
                node.prelim = node.left_sibling.prelim + self.sibling_separation + self.mean_width
                node.modifier = node.prelim - midpoint
                self.tree_apportion(node, level)
            else:
                node.prelim = midpoint

    def tree_mean_node_size(self, left_node, right_node):
        # Write your own code for this procedure if your  rendered nodes will have variable sizes.
        # ----------------------------------------------------------
        # Here I add the width of the contents of the right half of the pLeftNode to the left half of the
        # right node. Since the size of the contents for all nodes is currently the same, this module computes the
        # following trivial computation.
        self.mean_width = 0
        if self.root_orientation in ('NORTH', 'SOUTH'):
            if left_node:
                self.mean_width += left_node.width / 2
            if right_node:
                self.mean_width += right_node.width / 2
        else:
            if left_node:
                self.mean_width += left_node.height / 2
            if right_node:
                self.mean_width += right_node.height / 2

    def tree_apportion(self, node, level):
        #  Clean up the positioning of small sibling subtrees.
        #  Subtrees of a node are formed independently and
        #  placed as close together as possible. By requiring
        #  that the subtrees be rigid at the time they are put
        #  together, we avoid the undesirable effects that can
        #  accrue from positioning nodes rather than subtrees.
        left_most: Node = node.first_child
        compare_depth = 1
        depth_to_stop = self.maximum_depth - level

        # Compute the location of `left_most` and where it should be with respect to `neighbor`.
        while left_most and compare_depth <= depth_to_stop:
            neighbor = left_most.left_cousin if left_most else None

            # no subtree to the left of this subtree from this level onwards
            if neighbor is None:
                break

            right_modsum = left_modsum = 0
            ancestor_leftmost = left_most
            ancestor_neighbor = neighbor
            for _ in range(0, compare_depth):
                ancestor_leftmost = ancestor_leftmost.parent
                ancestor_neighbor = ancestor_neighbor.parent
                right_modsum += ancestor_leftmost.modifier
                left_modsum += ancestor_neighbor.modifier

                # Determine the flDistance to be moved, and apply it to `node` subtree.  Apply appropriate
            # portions to smaller interior subtrees
            self.tree_mean_node_size(left_most, neighbor)

            distance = (neighbor.prelim + left_modsum + self.subtree_separation +
                        self.mean_width - (left_most.prelim + right_modsum))

            if distance > 0:
                # Count the interior sibling subtrees
                n_left_siblings = 0
                sibling: Node = node  # "pTempPtr"
                while sibling is not None and sibling != ancestor_neighbor:
                    sibling = sibling.left_sibling
                    n_left_siblings += 1

                if sibling is None:
                    # Don't need to move anything--it needs to be done by an ancestor because
                    # pAncestorNeighbor and pAncestorLeftmost are not siblings of each other.
                    return

                #  Apply portions to appropriate leftsibling subtrees.
                portion = distance / n_left_siblings
                sibling: Node = node
                while sibling != ancestor_neighbor:
                    sibling.prelim += distance
                    sibling.modifier += distance
                    distance -= portion
                    sibling = sibling.left_sibling

            # Determine the leftmost descendant of `node`  at the next lower level to compare its
            # positioning against that of its `neighbor`
            compare_depth += 1
            if left_most.is_leaf():
                left_most = self.tree_get_leftmost(node, 0, compare_depth)
            else:
                left_most = left_most.first_child

    def tree_get_leftmost(self, node: Node, level: int, search_depth: int):
        #  Determine the leftmost descendant of a node at a given search depth. This is implemented using a post-order
        #  walk of the subtree under `node`, down to the level of `search_depth`. If we've searched to the
        #  proper distance, return the currently leftmost node.
        #  Otherwise, recursively look at the progressively lower levels.
        if level == search_depth:
            return node  # searched far enough.

        # Do a post-order walk of the subtree.
        for child in node.children:
            left_most = self.tree_get_leftmost(child, level + 1, search_depth)
            if left_most:
                return left_most

        # no subtree get to depth search_depth (or there isn't any subtree)
        return None

    def tree_second_walk(self,
                         node: Node,
                         modsum: int = 0):
        # During a second pre-order walk, each node is given a final x-coordinate by summing its preliminary
        # x-coordinate and the modifiers of all the node's ancestors.  The y-coordinate depends on the height of
        # the tree.
        # (The roles of x and y are reversed for RootOrientations of EAST or WEST.)
        if node.level > self.maximum_depth:
            return

        if self.root_orientation == 'NORTH':
            node.x = node.prelim + modsum
            node.y = self.min_y + node.level * (self.node_height + self.level_separation)
        elif self.root_orientation == 'SOUTH':
            node.x = node.prelim + modsum
            node.y = self.min_y + node.level * (self.node_height + self.level_separation)
        elif self.root_orientation == 'EAST':
            node.x = self.min_y + node.level * (self.node_height + self.level_separation)
            node.y = node.prelim + modsum
        else:
            node.x = self.min_y + node.level * (self.node_height + self.level_separation)
            node.y = node.prelim + modsum

        for child in node.children:
            self.tree_second_walk(child, modsum + node.modifier)

    def fix_min_x(self, apex):
        def tree_min(node):
            if node.is_leaf():
                return node.x
            return min(tree_min(child) for child in node.children)

        def shift(node, shift_by):
            node.x += shift_by
            for child in node.children:
                shift(child, shift_by)

        shift(apex, self.min_x - tree_min(apex))

    def fix_min_y(self, apex):
        def tree_min(node):
            if node.is_leaf():
                return node.y
            return min(tree_min(child) for child in node.children)

        def shift(node, shift_by):
            node.y += shift_by
            for child in node.children:
                shift(child, shift_by)

        shift(apex, self.min_x - tree_min(apex))
