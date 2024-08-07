/***********************************************************
 *  Node-Positioning for General Trees, by John Q. Walker II
 *
 *  Initiated by calling procedure TreePosition().
 **********************************************************/

#include <stdlib.h>

/*----------------------------------------------------------
 * Implementation dependent: Set the values for each of
 * these variables.
 *--------------------------------------------------------*/
#define NODE_WIDTH          20  /* Width of a node?       */
#define NODE_HEIGHT         10  /* Height of a node?      */
#define FRAME_THICKNESS     1   /* Fixed-sized node frame?*/
#define SUBTREE_SEPARATION  5   /* Gap between subtrees?  */
#define SIBLING_SEPARATION  4   /* Gap between siblings?  */
#define LEVEL_SEPARATION    5   /* Gap between levels?    */
#define MAXIMUM_DEPTH       10  /* Biggest tree?          */

/*----------------------------------------------------------
 * Implementation dependent: The structure for one node
 * - The first 4 pointers must be set for each node before
 *   this algorithm is called.
 * - The X and Y coordinates must be set for only the apex
 *   of the tree upon entry; they will be set by this
 *   algorithm for all the other nodes.
 * - The next three elements are used only for the duration
 *   of the algorithm.
 * - Actual contents of the node depend on your application.
 *--------------------------------------------------------*/
typedef int COORD;              /* X,Y coordinate type    */

typedef struct node {
   struct node *parent;        /* ptr: node's parent     */
   struct node *offspring;     /* ptr: leftmost child    */
   struct node *leftsibling;   /* ptr: sibling on left   */
   struct node *rightsibling;  /* ptr: sibling on right  */
   COORD  xCoordinate;         /* node's current x coord */
   COORD  yCoordinate;         /* node's current y coord */

   struct node *prev;          /* ptr: lefthand neighbor */
   float  flPrelim;            /* preliminary x coord    */
   float  flModifier;          /* temporary modifier     */

   char   info[80];            /* pick your contents!    */
} *PNODE;                       /* ptr: a node structure  */

/*----------------------------------------------------------
 * Global variables used by the algorithm
 *--------------------------------------------------------*/
typedef enum { FALSE, TRUE } BOOL;
typedef enum { FRAME, NO_FRAME } FRAME_TYPE;
typedef enum { NORTH, SOUTH, EAST, WEST } ROOT_ORIENTATION;

typedef struct prev_node {      /* one list element        */
   PNODE pPreviousNode;        /* ptr: previous at level  */
   struct prev_node *pNextLevel;   /*  ptr: next element  */
} *PPREVIOUS_NODE;

static FRAME_TYPE FrameType = FRAME;    /*  Show a frame   */
static ROOT_ORIENTATION RootOrientation = NORTH; /*  At top*/
static PPREVIOUS_NODE pLevelZero = (PPREVIOUS_NODE)0;

static COORD xTopAdjustment;    /* How to adjust the apex */
static COORD yTopAdjustment;    /* How to adjust the apex */
static float flMeanWidth;       /* Ave. width of 2 nodes  */

#define FIRST_TIME (0)          /* recursive proc flag    */

/*----------------------------------------------------------
 * Implemented as macros, but could be implemented as
 * procedures depending on your particular node structures
 *--------------------------------------------------------*/

#define FirstChild(node)     ((PNODE)((node)->offspring))
#define LeftSibling(node)    ((PNODE)((node)->leftsibling))
#define RightSibling(node)   ((PNODE)((node)->rightsibling))
#define Parent(node)         ((PNODE)((node)->parent))
#define LeftNeighbor(node)   ((PNODE)((node)->prev))
#define IsLeaf(node)          \
            (((node)&&(!((node)->offspring)))?TRUE:FALSE)
#define HasChild(node)        \
                  (((node)&&((node)->offspring))?TRUE:FALSE)
#define HasLeftSibling(node)   \
             (((node)&&((node)->leftsibling))?TRUE:FALSE)
#define HasRightSibling(node)  \
            (((node)&&((node)->rightsibling))?TRUE:FALSE)

static PNODE GetPrevNodeAtLevel (unsigned nLevelNbr)
{
   /*------------------------------------------------------
    * List Manipulation: Return pointer to previous node at
    * this level
    *----------------------------------------------------*/
   PPREVIOUS_NODE pTempNode;   /* used in the for-loop   */
   unsigned i = 0;             /* level counter          */

   for (pTempNode = pLevelZero; (pTempNode);
       pTempNode = pTempNode->pNextLevel) {
      if (i++ == nLevelNbr)
         /* Reached desired level.  Return its pointer */
         return (pTempNode->pPreviousNode);
   }
   return ((PNODE)0); /* No pointer yet for this level. */
}

static BOOL SetPrevNodeAtLevel (unsigned nLevelNbr,
                           PNODE pThisNode)
{

   /*------------------------------------------------------
    * List Manipulation: Set the list element to the
    * previous node at this level
    *----------------------------------------------------*/

   PPREVIOUS_NODE pTempNode;   /* used in the for-loop   */
   PPREVIOUS_NODE pNewNode;    /* newly-allocated memory */
   unsigned i = 0;             /* level counter          */

   for (pTempNode = pLevelZero; (pTempNode);
       pTempNode = pTempNode->pNextLevel) {
      if (i++ == nLevelNbr) {
         /* Reached desired level. Return its pointer */
         pTempNode->pPreviousNode = pThisNode;
         return (TRUE);
      }
      else if (pTempNode->pNextLevel==(PPREVIOUS_NODE)0) {
         /* Looks like we need a new level: add it.    */
         /* We need to keep going--should be the next. */
         pNewNode = (PPREVIOUS_NODE)
                  malloc(sizeof(struct prev_node));
         if (pNewNode) {
            pNewNode->pPreviousNode = (PNODE)0;
            pNewNode->pNextLevel = (PPREVIOUS_NODE)0;
            pTempNode->pNextLevel = pNewNode;
         }
         else return (FALSE);    /* The malloc failed. */
      }
   }

   /* Should only get here if pLevelZero is 0.           */
   pLevelZero = (PPREVIOUS_NODE)
              malloc(sizeof(struct prev_node));
   if (pLevelZero) {
      pLevelZero->pPreviousNode = pThisNode;
      pLevelZero->pNextLevel = (PPREVIOUS_NODE)0;
      return (TRUE);
   }
   else return (FALSE);        /* The malloc() failed.   */
}

static void InitPrevNodeAtLevel (void)
{
   /*------------------------------------------------------
    * List Manipulation: Initialize the list of the
    * previous node at each level to all zeros.
    *----------------------------------------------------*/

   PPREVIOUS_NODE pTempNode = pLevelZero; /*  the start    */

   for ( ; (pTempNode); pTempNode = pTempNode->pNextLevel)
      pTempNode->pPreviousNode = (PNODE)0;
}

static BOOL CheckExtentsRange(long lxTemp, long lyTemp)
{
   /*-----------------------------------------------------
    * Insert your own code here, to check when the
    * tree drawing is going to be too big. My region is no
    * more that 64000 units square.
    *---------------------------------------------------*/

   if ((labs(lxTemp) > 32000) || (labs(lyTemp) > 32000))
      return (FALSE);
   else
      return (TRUE);
}

static void TreeMeanNodeSize (PNODE pLeftNode,
                         PNODE pRightNode)
{
   /*------------------------------------------------------
    * Write your own code for this procedure if your
    * rendered nodes will have variable sizes.
    *------------------------------------------------------
    * Here I add the width of the contents of the
    * right half of the pLeftNode to the left half of the
    * right node. Since the size of the contents for all
    * nodes is currently the same, this module computes the
    * following trivial computation.
    *----------------------------------------------------*/

   flMeanWidth = (float)0.0;   /* Initialize this global */

   switch (RootOrientation) {
      case NORTH:
      case SOUTH:
         if (pLeftNode) {
            flMeanWidth = flMeanWidth +
                       (float)(NODE_WIDTH/2);
            if (FrameType != NO_FRAME)
               flMeanWidth = flMeanWidth +
                             (float)FRAME_THICKNESS;
         }
         if (pRightNode) {
            flMeanWidth = flMeanWidth +
                       (float)(NODE_WIDTH/2);
            if (FrameType != NO_FRAME)
                flMeanWidth = flMeanWidth +
                              (float)FRAME_THICKNESS;
         }
         break;
      case EAST :
      case WEST :
         if (pLeftNode) {
            flMeanWidth = flMeanWidth +
                       (float)(NODE_HEIGHT/2);
            if (FrameType != NO_FRAME)
                flMeanWidth = flMeanWidth +
                              (float)FRAME_THICKNESS;
         }
         if (pRightNode) {
            flMeanWidth = flMeanWidth +
                       (float)(NODE_HEIGHT/2);
            if (FrameType != NO_FRAME)
                flMeanWidth = flMeanWidth +
                              (float)FRAME_THICKNESS;
         }
         break;
   }
}

static PNODE TreeGetLeftmost(PNODE pThisNode,
                        unsigned nCurrentLevel,
                        unsigned nSearchDepth)
{
   /*------------------------------------------------------
    * Determine the leftmost descendant of a node at a
    * given depth. This is implemented using a post-order
    * walk of the subtree under pThisNode, down to the
    * level of nSearchDepth. If we've searched to the
    * proper distance, return the currently leftmost node.
    * Otherwise, recursively look at the progressively
    * lower levels.
    *----------------------------------------------------*/

   PNODE pLeftmost;    /* leftmost descendant at level   */
   PNODE pRightmost;   /* rightmost offspring in search  */

   if (nCurrentLevel == nSearchDepth)
      pLeftmost = pThisNode; /*  searched far enough.    */
   else if (IsLeaf(pThisNode))
      pLeftmost = 0;  /* This node has no descendants    */
   else {  /* Do a post-order walk of the subtree.        */
      for (pLeftmost = TreeGetLeftmost(pRightmost =
                          FirstChild(pThisNode),
                          nCurrentLevel + 1,
                          nSearchDepth)

         ;
         (pLeftmost==0) && (HasRightSibling(pRightmost))
         ;
         pLeftmost = TreeGetLeftmost(pRightmost =
                          RightSibling(pRightmost),
                          nCurrentLevel + 1,
                          nSearchDepth)
         ) { /* Nothing inside this for-loop. */ }
   }
   return (pLeftmost);
}

static void TreeApportion (PNODE pThisNode,
                      unsigned nCurrentLevel)
{
   /*------------------------------------------------------
    * Clean up the positioning of small sibling subtrees.
    * Subtrees of a node are formed independently and
    * placed as close together as possible. By requiring
    * that the subtrees be rigid at the time they are put
    * together, we avoid the undesirable effects that can
    * accrue from positioning nodes rather than subtrees.
    *----------------------------------------------------*/

   PNODE pLeftmost;            /* leftmost at given level*/
   PNODE pNeighbor;            /* node left of pLeftmost */
   PNODE pAncestorLeftmost;    /* ancestor of pLeftmost  */
   PNODE pAncestorNeighbor;    /* ancestor of pNeighbor  */
   PNODE pTempPtr;             /* loop control pointer   */
   unsigned i;                 /* loop control           */
   unsigned nCompareDepth;     /* depth of comparison    */
                          /* within this proc       */
   unsigned nDepthToStop;      /* depth to halt          */
   unsigned nLeftSiblings;     /* nbr of siblings to the */
           /* left of pThisNode, including pThisNode,  */
           /* til the ancestor of pNeighbor            */
   float flLeftModsum;         /* sum of ancestral mods  */
   float flRightModsum;        /* sum of ancestral mods  */
   float flDistance;           /* difference between     */
        /* where pNeighbor thinks pLeftmost should be   */
        /* and where pLeftmost actually is              */
   float flPortion;            /* proportion of          */
        /* flDistance to be added to each sibling       */

   pLeftmost = FirstChild(pThisNode);
   pNeighbor = LeftNeighbor(pLeftmost);

   nCompareDepth = 1;
   nDepthToStop = MAXIMUM_DEPTH - nCurrentLevel;

   while ((pLeftmost) && (pNeighbor) &&
         (nCompareDepth <= nDepthToStop)) {

      /* Compute the location of pLeftmost and where it */
      /* should be with respect to pNeighbor.           */
      flRightModsum = flLeftModsum = (float)0.0;
      pAncestorLeftmost = pLeftmost;
      pAncestorNeighbor = pNeighbor;
      for (i = 0; (i < nCompareDepth); i++) {
         pAncestorLeftmost = Parent(pAncestorLeftmost);
         pAncestorNeighbor = Parent(pAncestorNeighbor);
         flRightModsum = flRightModsum +
                      pAncestorLeftmost->flModifier;
         flLeftModsum = flLeftModsum +
                      pAncestorNeighbor->flModifier;

      }

      /* Determine the flDistance to be moved, and apply*/
      /* it to "pThisNode's" subtree.  Apply appropriate*/
      /* portions to smaller interior subtrees          */

      /* Set the global mean width of these two nodes   */
      TreeMeanNodeSize(pLeftmost, pNeighbor);

      flDistance = (pNeighbor->flPrelim +
                  flLeftModsum +
                  (float)SUBTREE_SEPARATION +
                  (float)flMeanWidth) -
                 (pLeftmost->flPrelim + flRightModsum);

      if (flDistance > (float)0.0) {
         /* Count the interior sibling subtrees        */
         nLeftSiblings = 0;
         for (pTempPtr = pThisNode;
              (pTempPtr) &&
              (pTempPtr != pAncestorNeighbor);
             pTempPtr = Leftsibling(pTempPtr)) {
            nLeftSiblings++;
         }

         if (pTempPtr) {
            /* Apply portions to appropriate          */
            /* leftsibling subtrees.                  */
            flPortion = flDistance/(float)nLeftSiblings;
            for (pTempPtr = pThisNode;
                (pTempPtr != pAncestorNeighbor);
                pTempPtr = LeftSibling(pTempPtr)) {
               pTempPtr->flPrelim =
                    pTempPtr->flPrelim + flDistance;
               pTempPtr->flModifier =
                    pTempPtr->flModifier + flDistance;
               flDistance = flDistance - flPortion;
             }
         }
         else {
            /* Don't need to move anything--it needs  */
            /* to be done by an ancestor because      */
            /* pAncestorNeighbor and                  */
            /* pAncestorLeftmost are not siblings of  */
            /* each other.                            */
            return;
         }
      }  /* end of the while                           */

      /* Determine the leftmost descendant of pThisNode */
      /* at the next lower level to compare its         */
      /* positioning against that of its pNeighbor.     */

      nCompareDepth++;
      if (IsLeaf(pLeftmost))
         pLeftmost = TreeGetLeftmost(pThisNode, 0,
                                 nCompareDepth);
      else
         pLeftmost = FirstChild(pLeftmost);
      pNeighbor = LeftNeighbor(pLeftmost);
   }
 }

 static BOOL TreeFirstWalk(PNODE pThisNode,
                       unsigned nCurrentLevel)
 {
   /*------------------------------------------------------
    * In a first post-order walk, every node of the tree is
    * assigned a preliminary x-coordinate (held in field
    * node->flPrelim). In addition, internal nodes are
    * given modifiers, which will be used to move their
    * children to the right (held in field
    * node->flModifier).
    * Returns: TRUE if no errors, otherwise returns FALSE.
    *----------------------------------------------------*/

   PNODE pLeftmost;            /* left- & rightmost      */
   PNODE pRightmost;           /* children of a node.    */
   float flMidpoint;           /* midpoint between left- */
                          /* & rightmost children   */

   /* Set up the pointer to previous node at this level  */
   pThisNode->prev = GetPrevNodeAtLevel(nCurrentLevel);

   /* Now we're it--the previous node at this level      */
   if (!(SetPrevNodeAtLevel(nCurrentLevel, pThisNode)))
      return (FALSE);        /* Can't allocate element  */

   /* Clean up old values in a node's flModifier         */
   pThisNode->flModifier = (float)0.0;

   if ((IsLeaf(pThisNode)) ||
      (nCurrentLevel == MAXIMUM_DEPTH)) {
      if (HasLeftSibling(pThisNode)) {

      /*--------------------------------------------
       * Determine the preliminary x-coordinate
       *   based on:
       * - preliminary x-coordinate of left sibling,
       * - the separation between sibling nodes, and
       * - mean width of left sibling & current node.
       *--------------------------------------------*/
      /* Set the mean width of these two nodes      */
      TreeMeanNodeSize(LeftSibling(pThisNode),
                    pThisNode);

      pThisNode->flPrelim =
                (pThisNode->Leftsibling->flPrelim) +
                (float)SIBLING_SEPARATION +
                flMeanWidth;
   }
   else    /*  no sibling on the left to worry about  */
      pThisNode->flPrelim = (float)0.0;
}
else {
   /* Position the leftmost of the children          */
   if (TreeFirstWalk(pLeftmost = pRightmost =
                  FirstChild(pThisNode),
                  nCurrentLevel + 1)) {
      /* Position each of its siblings to its right */
      while (HasRightSibling(pRightmost)) {
         if (TreeFirstWalk(pRightmost =
                        RightSibling(pRightmost),
                        nCurrentLevel + 1)) {
         }
         else return (FALSE); /* malloc() failed   */
      }

      /* Calculate the preliminary value between   */
      /* the children at the far left and right    */
      flMidpoint = (pLeftmost->flPrelim +
                  pRightmost->flPrelim)/(2.0);

      /* Set global mean width of these two nodes  */
      TreeMeanNodeSize(LeftSibling(pThisNode),
                    pThisNode);

         if (HasLeftSibling(pThisNode)) {
            pThisNode->flPrelim =
                   (pThisNode->leftsibling->flPreLim) +
                           (float)SIBLING_SEPARATION +
                           flMeanWidth;
            pThisNode->flModifier =
                pThisNode->flPrelim - flMidpoint;
            TreeApportion(pThisNode, nCurrentLevel);
         }
         else pThisNode->flPrelim = flMidpoint;
      }
      else return (FALSE); /* Couldn't get an element  */
   }
   return (TRUE);
}

static BOOL TreeSecondWalk(PNODE pThisNode,
                      unsigned nCurrentLevel)
{
   /*------------------------------------------------------
    * During a second pre-order walk, each node is given a
    * final x-coordinate by summing its preliminary
    * x-coordinate and the modifiers of all the node's
    * ancestors.  The y-coordinate depends on the height of
    * the tree.  (The roles of x and y are reversed for
    * RootOrientations of EAST or WEST.)
    * Returns: TRUE if no errors, otherwise returns FALSE.
    *----------------------------------------- ----------*/

   BOOL bResult = TRUE;        /* assume innocent        */
   long lxTemp, lyTemp;        /* hold calculations here */
   float flNewModsum;          /* local modifier value   */
   static float flModsum = (float)0.0;

   if (nCurrentLevel <= MAXIMUM_DEPTH) {
      flNewModsum = flModsum;  /* Save the current value  */
      switch (RootOrientation) {
         case NORTH:
            lxTemp = (long)xTopAdjustment + (long)(pThisNode->flPrelim + flModsum);
            lyTemp = (long)yTopAdjustment + (long)(nCurrentLevel * LEVEL_SEPARATION);
            break;
         case SOUTH:
            lxTemp = (long)xTopAdjustment + (long)(pThisNode->flPrelim + flModsum);
            lyTemp = (long)yTopAdjustment - (long)(nCurrentLevel * LEVEL_SEPARATION);
            break;
         case EAST:
            lxTemp = (long)xTopAdjustment + (long)(nCurrentLevel * LEVEL_SEPARATION);
            lyTemp = (long)yTopAdjustment - (long)(pThisNode->flPrelim + flModsum);
            break;
         case WEST:
            lxTemp = (long)xTopAdjustment - (long)(nCurrentLevel * LEVEL_SEPARATION);
            lyTemp = (long)yTopAdjustment - (long)(pThisNode->flPrelim + flModsum);
            break;
      }

      if (CheckExtentsRange(lxTemp, lyTemp)) {
         /* The values are within the allowable range */

         pThisNode->xCoordinate = (COORD)lxTemp;
         pThisNode->yCoordinate = (COORD)lyTemp;

         if (HasChild(pThisNode)) {
            /* Apply the flModifier value for this    */
            /* node to all its offspring.             */
            flModsum = flNewModsum =
                   flNewModsum + pThisNode->flModifier;
            bResult = TreeSecondWalk(
               FirstChild(pThisNode),nCurrentLevel + 1);
            flNewModsum = flNewModsum -
                        pThisNode->flModifier;
         }

         if ((HasRightSibling(pThisNode)) && (bResult)) {
            flModsum = flNewModsum;
            bResult = TreeSecondWalk(
                RightSibling(pThisNode), nCurrentLevel);
         }
      }
      else bResult = FALSE;   /* outside of extents   */
   }
   return (bResult);
}

static BOOL TreePosition(PNODE pApexNode)
{
   /*------------------------------------------------------
    * Determine the coordinates for each node in a tree.
    * Input: Pointer to the apex node of the tree
    * Assumption: The x & y coordinates of the apex node
    * are already correct, since the tree underneath it
    * will be positioned with respect to those coordinates.
    * Returns: TRUE if no errors, otherwise returns FALSE.
    *----------------------------------------------------*/

   if (pApexNode) {
      /* Initialize list of previous node at each level */
      InitPrevNodeAtLevel();

      /* Generate the properly-placed tree nodes.      */
      /* TreeFirstWalk: a post-order walk              */
      /* TreeSecondWalk: a pre-order walk              */
      if (TreeFirstWalk (pApexNode, FIRST_TIME)) {
         /* Determine how to adjust the nodes with     */
         /* respect to the location of the apex of the */
         /* tree being positioned.                     */
         switch (RootOrientation) {
            case NORTH:
            case SOUTH:
               /* Create the adjustment from x-coord  */
               xTopAdjustment = pApexNode->xCoordinate -
                        (COORD)(pApexNode->flPrelim);
               yTopAdjustment = pApexNode->yCoordinate;
               break;
            case EAST :
            case WEST :
               /* Create the adjustment from y-coord  */
               xTopAdjustment = pApexNode->xCoordinate;
               yTopAdjustment = pApexNode->yCoordinate +
                        (COORD)(pApexNode->flPrelim);
               break;
         }
         return (TreeSecondWalk(pApexNode, FIRST_TIME));
      }
      else return (FALSE); /*  Couldn't get an element   */
   }
   else return (TRUE); /*  Easy: null pointer was passed  */
}