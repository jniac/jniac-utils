/**
 * Quite complex function that returns "pool" indexes according to a given position.  
 * This is useful for loading a range of items from a collection (eg: a picture viewer).
 * 
 * Examples of returns (current position is between braces):
 * 
 * - Without loop. Note that the first and last 3 rows are the same.
 * ```
 * getPoolIndexesInRange(8, 5, x)
 * ```
 * ```
 * {0}   1    2    3    4 
 *  0   {1}   2    3    4 
 *  0    1   {2}   3    4 
 *  5    1    2   {3}   4 
 *  5    6    2    3   {4}
 * {5}   6    7    3    4 
 *  5   {6}   7    3    4 
 *  5    6   {7}   3    4 
 * ```
 * 
 * - Within a loop. Indexes from the other "side" are retrieved.
 * ```
 * getPoolIndexesInRange(8, 5, x, true)
 * ```
 * ```
 *  6    7   {0}   1    2 
 *  3    7    0   {1}   2 
 *  3    4    0    1   {2}
 * {3}   4    5    1    2 
 *  3   {4}   5    6    2 
 *  3    4   {5}   6    7 
 * {6}   7    0    4    5 
 *  6   {7}   0    1    5 
 * ```
 * 
 * NOTE: This may be simplified by using vertical series (cf Simplification NOTE).
 *  
 * @param itemCount size of the pool
 * @param poolSize number of items shown from the pool
 * @param position current position in the pool (>= 0 && < poolCount)
 * @param loop should the index loop over the
 */
export const getItemIndexesFromPool = function* (poolSize: number, itemCount: number, position: number, loop = false) {
  const count = Math.min(itemCount, poolSize)
  const offset = Math.floor((count - 1) / 2)
  if (loop === false) {
    position += -offset
    const max = poolSize - count
    position = position < 0 ? 0 : position > max ? max : position
    const delta = poolSize - position - (poolSize % itemCount)
    for (let i = 0; i < count; i++) {
      let index = i + delta
      index %= count
      index += position
      index %= poolSize
      yield index
    }
  } else {
    const delta = (poolSize * 2 - position - (poolSize % itemCount)) % poolSize
    for (let i = 0; i < count; i++) {
      let index = i + delta
      index %= count
      index += position + poolSize - offset
      index %= poolSize
      yield index
    }
  }
}

/**
  
  Simplification NOTE

  Observing the following patterns, it seems clear that another approach could be:
  Generate "vertical" series. 

 {0}   1    2    3    4 
  0   {1}   2    3    4 
  0    1   {2}   3    4 
  5    1    2   {3}   4 
  5    6    2    3   {4}
 {5}   6    7    3    4 
  5   {6}   7    8    4 
  5    6   {7}   8    9 
 10    6    7   {8}   9 
 10   11    7    8   {9}
{10}  11   12    8    9 
 10  {11}  12   13    9 
 10   11  {12}  13   14 
 15   11   12  {13}  14 
 15   16   12   13  {14}
{15}  16   17   13   14 
 15  {16}  17   18   14 
 15   16  {17}  18   19 
 20   16   17  {18}  19 
 20   21   17   18  {19}
{20}  21   22   18   19 
 20  {21}  22   23   19 
 20   21  {22}  23   24 
 25   21   22  {23}  24 
 25   26   22   23  {24}
{25}  26   27   23   24 
 25  {26}  27   28   24 
 25   26  {27}  28   29 
 30   26   27  {28}  29 
 30   31   27   28  {29}
{30}  31   32   28   29 
 30  {31}  32   28   29 
 30   31  {32}  28   29 

 31   32   {0}   1    2 
  3   32    0   {1}   2 
  3    4    0    1   {2}
 {3}   4    5    1    2 
  3   {4}   5    6    2 
  3    4   {5}   6    7 
  8    4    5   {6}   7 
  8    9    5    6   {7}
 {8}   9   10    6    7 
  8   {9}  10   11    7 
  8    9  {10}  11   12 
 13    9   10  {11}  12 
 13   14   10   11  {12}
{13}  14   15   11   12 
 13  {14}  15   16   12 
 13   14  {15}  16   17 
 18   14   15  {16}  17 
 18   19   15   16  {17}
{18}  19   20   16   17 
 18  {19}  20   21   17 
 18   19  {20}  21   22 
 23   19   20  {21}  22 
 23   24   20   21  {22}
{23}  24   25   21   22 
 23  {24}  25   26   22 
 23   24  {25}  26   27 
 28   24   25  {26}  27 
 28   29   25   26  {27}
{28}  29   30   26   27 
 28  {29}  30   31   27 
 28   29  {30}  31   32 
{31}  32    0   29   30 
 31  {32}   0    1   30 
 
*/

