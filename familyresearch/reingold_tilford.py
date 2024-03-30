# https:/rachel53461.wordpress.com/tag/reingold-tilford/

# todo: contours output shouldn't include root
#       contours can be built as part of the recursion rather than re-calculated every time
#       test 2 now fails
#     - support for spouses using variable node size
#     - recentering intermediate nodes doesn't work if they have children ; currently disabled needs fixing

class Node:
    y: int = -1
    mod: int = 0
    x: int = -1

    def __init__(self, value, parent: "Node" = None):
        self.value = value
        self.parent = parent
        self.children = []
        if parent:
            parent.children.append(self)
            self.index_in_parent = len(parent.children) - 1

    def is_leaf(self):
        return not self.children

    def is_leftmost(self):
        return not self.parent or self.index_in_parent == 0

    def is_rightmost(self):
        return not self.parent or self.index_in_parent == len(self.parent.children) - 1

    @property
    def leftmost_sibling(self):
        if not self.parent:
            return None
        return self.parent.children[0]

    @property
    def previous_sibling(self):
        if self.is_leftmost():
            return None
        return self.parent.children[self.index_in_parent - 1]

    @property
    def previous_siblings(self):
        if self.parent:
            return self.parent.children[0: self.index_in_parent]
        return []

    @property
    def next_sibling(self):
        if self.is_rightmost():
            return None
        return self.parent.children[self.index_in_parent + 1]

    @property
    def width(self):
        if self.is_leaf():
            return self.x
        else:
            return min(child.width for child in self.children)

    @property
    def height(self):
        if self.is_leaf():
            return self.y
        else:
            return min(child.height for child in self.children)

    def __repr__(self):
        return self.value


class ReingoldTilford:
    def __init__(self, node_size=1, sibling_distance=0, tree_distance=0):
        self.node_size = node_size
        self.sibling_distance = sibling_distance
        self.tree_distance = tree_distance

    def calculate_node_positions(self, root):
        self.initialise_depth(root, 0)

        self.calculate_initial_x(root)

        # self.check_all_children_on_screen(root)
        self.shift_back_to_zero(root)

        self.calculate_final_positions(root, 0)



    def initialise_depth(self, node, depth: int):
        node.y = depth
        for child in node.children:
            self.initialise_depth(child, depth + 1)

    def calculate_initial_x(self, node: Node):
        for child in node.children:
            self.calculate_initial_x(child)

        if node.is_leftmost():
            if node.is_leaf():
                node.x = 0
            elif len(node.children) == 1:
                node.x = node.children[0].x
            else:
                node.x = (node.children[0].x + node.children[-1].x) / 2

            print(f"Node '{node.value}'.x={node.x}")
        else:
            node.x = node.previous_sibling.x + self.node_size + self.sibling_distance

            print(f"Node '{node.value}'.x={node.x}")

            # now the fun part.
            if not node.is_leaf():
                # calculate how much the children need to be shifted right in order to be centered under the parent,
                # note that this could be negative, which would be resolved by check_for_conflicts and/or
                # check_all_children_on_screen
                if len(node.children) == 1:
                    node.mod = node.x - node.children[0].x
                else:
                    node.mod = node.x - (node.children[0].x + node.children[-1].x) / 2

                print(f"Node '{node.value}'.mod={node.mod}")

                self.check_for_conflicts(node)

    def check_for_conflicts(self, node: Node):
        min_distance = self.tree_distance + self.node_size

        for sibling in node.previous_siblings:
            node_contour = {}
            self.get_left_contour(node, 0, node_contour)
            sibling_contour = {}
            self.get_right_contour(sibling, 0, sibling_contour)

            distances = [
                node_contour[level] - sibling_contour[level]
                for level in node_contour.keys()
                if level in sibling_contour
                and node_contour[level] - sibling_contour[level] < min_distance
                and level > node.y
            ]

            if distances:
                shift_value = min_distance - min(distances)
                node.x += shift_value
                node.mod += shift_value
                print(f"Node '{node.value}' shifting by {shift_value}. node.x={node.x}, mode.mod={node.mod}")
                # self.center_nodes_between(sibling, node)

    def get_left_contour(self, node, mod_sum, values: dict[int, float]):
        # for each subtree level from node.y down, find the leftmost (minimum) x value required for tree
        if node.y not in values or values[node.y] > node.x + mod_sum:
            values[node.y] = node.x + mod_sum
        for child in node.children:
            self.get_left_contour(child, mod_sum + node.mod, values)

    def get_right_contour(self, node, mod_sum, values: dict[int, float]):
        if node.y not in values or values[node.y] < node.x + mod_sum:
            values[node.y] = node.x + mod_sum
        for child in node.children:
            self.get_right_contour(child, mod_sum + node.mod, values)

    def center_nodes_between(self, left_node: Node, right_node: Node):
        assert left_node.parent == right_node.parent
        assert left_node.index_in_parent < right_node.index_in_parent
        assert left_node.x < right_node.x

        number_of_nodes_between = right_node.index_in_parent - left_node.index_in_parent - 1
        print(f"Re-centering {number_of_nodes_between} nodes between '{left_node.value}' and '{right_node.value}'")
        distance_between_nodes = (right_node.x - left_node.x) / (number_of_nodes_between + 1)
        nodes_between = left_node.parent.children[left_node.index_in_parent + 1: right_node.index_in_parent]
        for count, middle_node in enumerate(nodes_between, start=1):
            desired_x = left_node.x + distance_between_nodes * count
            offset = desired_x - middle_node.x
            middle_node.x += offset
            middle_node.mod += offset

    def check_all_children_on_screen(self, node):
        node_contour = {}
        self.get_left_contour(node, 0, node_contour)
        shift_amount = 0
        for left_most_child_at_level in node_contour.values():
            if left_most_child_at_level + shift_amount < 0:
                shift_amount += -1 * left_most_child_at_level

        if shift_amount > 0:
            node.x += shift_amount
            node.mod += shift_amount

    def shift_back_to_zero(self, root):
        # def find_smallest_x(node):
        #     if node.is_leaf():
        #         return node.x
        #     return min(node.x, min(find_smallest_x(child) for child in node.children))

        # left_most_child_at_any_level = find_smallest_x(root)

        node_contour = {}
        self.get_left_contour(root, 0, node_contour)
        left_most_child_at_any_level = min(node_contour.values())
        print("****************************", left_most_child_at_any_level)
        shift_amount = -1 * left_most_child_at_any_level
        root.x += shift_amount
        root.mod += shift_amount



    def calculate_final_positions(self, node: Node, mod_sum):
        node.x += mod_sum
        print(f"Final. Node '{node.value}':{node.x}   ({mod_sum})")
        for child in node.children:
            self.calculate_final_positions(child, mod_sum + node.mod)
