'use strict';

import Utils from './utils';
import Constants from './constants';

/**
* Grid
*/
function Grid() {
  this.container = null;
  this.gridWidth = null;
  this.gridHeight = null;
  this.col = null;
  this.row = null;
  this.gridWidthSpacer = null;
  this.gridHeightSpacer = null;
  this.tileWidth = null;
  this.tileHeight = null;
  this.coords = {
    all: [],
    free: [],
    taken: []
  };
}

/**
* Check availability of coords from coord
* @param {object} coords
*/
Grid.prototype.checkAvailabilityOfCoordsFromCoord = function(coords) {
  let y = 0;
  coords.forEach(coord => {
    let i = this.coords.free.length;
    while (i--) {
      if (this.coords.free[i].x === coord.x && this.coords.free[i].y === coord.y) {
        y++;
      }
    }
  });
  return coords.length === y;
};

/*
* Get occupation from coord
* This will get an array with all the point occuped by the tile
* @param {number} totalCol
* @param {number} totalRow
* @param {object} coord
*/
Grid.prototype.getOccupationFromCoord = function(params) {
  var {totalCol, totalRow, coord} = params;
  let coords = [];
  if (coord) {
    for (let i = 0; i < totalCol; i++) {
      for (let j = 0; j < totalRow; j++) {
        coords.push(this.getCoord(i + coord.x, j + coord.y));
      }
    }
    return coords;
  }
  // todo: should return something anyway
};

/*
* Get new tileArea
* Iterate across each free coordinates to test if the tile can be placed
* @param {string} tileSize
* @returns {array|undefined}
*/
Grid.prototype.getNewTileArea = function(tileSize) {
  let targets = [],
     totalCol = Constants.TILE_SIZE[tileSize].col,
     totalRow = Constants.TILE_SIZE[tileSize].row;
  this.coords.free.forEach(freeCoord => {
    // make sure the tile ending end don't go futher then the grid edge
    let tileRightEdge = (freeCoord.x + totalCol) * this.tileWidth,
        tileBottomEdge = (freeCoord.y + totalRow) * this.tileHeight;
    if (tileRightEdge <= this.gridWidth && tileBottomEdge <= this.gridHeight) {
      // We jsut fond a good spot for this tile.
      // It's time to check if the area is clear.
      let coords = this.getOccupationFromCoord({totalCol, totalRow, coord: freeCoord});
      if (this.checkAvailabilityOfCoordsFromCoord(coords)) {
        targets.push(freeCoord);
      }
    }
  });
  // If the targets is empty that mean 2 things:
  // - the tile was to big
  // - the tile had the right size but no area was available
  return targets.length > 0 ? this.shuffle(targets) : undefined;
};

/*
* Put free coor to taken coor
* @param {object} coord
*/
Grid.prototype.putFreeCoorToTakenCoor = function(coord) {
  //todo: Remove the if statement and add a filter before forEach
  this.coords.free.forEach((myCoord, index) => {
    // todo: clean this up
    if (myCoord.x === coord.x && myCoord.y === coord.y) {
      this.coords.free.splice(index, 1);
    }
  });
  this.coords.taken.push(coord);
};

/*
* Shuffle
* @param {object} o
*/
Grid.prototype.shuffle = function(o) {
  for(let j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

/*
* Get coord
* @param {number} x
* @param {number} y
*/
Grid.prototype.getCoord = function(x, y) {
    return {x, y};
};

/*
* Set coords
*/
Grid.prototype.setCoords = function() {
  for (let i = 0; i < this.col; i++) {
    for (let j = 0; j < this.row; j++) {
      this.coords.all.push(this.getCoord(i, j));
    }
  }
  //  Clone the arrayY of all position and add it to free position array.
  this.coords.free = this.coords.all;
};

/*
* Show coords
* This will show black dots for each coordonate
*/
Grid.prototype.showCoords = function() {
  this.coords.all.forEach(coord => {
    let left = this.gridWidth / this.col * coord.x;
    let top = this.gridHeight / this.row * coord.y;
    left = left * 100 / this.gridWidth;
    top = top * 100 / this.gridHeight;
    let node = document.createElement("DIV");
    node.style.cssText = `top: ${top-0.5}%; left: ${left-0.2}%`;
    this.container.appendChild(node);
  });
};

/*
* Build grid
* @param {string} el
* @param {number} gCol
* @param {number} gRow
*/
Grid.prototype.buildGrid = function(params) {
  var {el, col, row} = params;
  this.el = el;
  this.container = document.getElementById(el);
  this.gridWidth = this.container.clientWidth;
  this.gridHeight = this.container.clientHeight;
  this.col = col;//todo: this should be more specific. it will help understand the code when we call this from a sub function.
  this.row = row;
  this.gridWidthSpacer = 2 * 100 / this.gridWidth;
  this.gridHeightSpacer = 2 * 100 / this.gridHeight;
  this.tileWidth = this.gridWidth / col; //todo: find a more specific name for this. its more a zone or area then tile
  this.tileHeight = this.gridHeight / row;

  // Set coordonate
  this.setCoords();
  this.showCoords();
};

/**
* Tile
*/
Tiles.prototype = new Grid(); // inherit from Grid
Tiles.prototype.constructor = Tiles;
function Tiles() {
  this.tiles = [];
  this.tileQueue = [];
  for (let i = 0, len = 40; i < len; i++) {
    this.tiles.push({
      id: i,
      title: 'title',
      img: ''
    });
  }
}

/*
* Show tile
*/
Tiles.prototype.showTile = function(params) {
  var that = this;
  if(params.url){
    Utils.getJSON(params.url).then(function(response) {
      return JSON.parse(response);
    }).then(function(response) {
      that.buildTileElm(response);
    });
  }else{
    this.buildTileElm();
  }
};

/*
* Show tile
*/
Tiles.prototype.buildTileElm = function(response){
  this.tileQueue.forEach((item, index) => {
    let imgUrl = response ? response[index].img : '';
    let node = document.createElement("div");
    node.className = 'tile';
    node.style.cssText = `top: ${item.y}%; left: ${item.x}%; width: ${item.width}%; height: ${item.height}%; background-image: url(${imgUrl}); background-size: 100% 100%`;
    this.container.appendChild(node);
  });
};

/*
* Get next tile size
* This will get the next tile size to use.
* @param {string} tileIndex
*/
Tiles.prototype.getNextTileSize = function(tileIndex) {
  let currentTileCount = 0;
  let tileSize = null;
  for(let size in Constants.TILE_SIZE){
    currentTileCount = currentTileCount + Constants.TILE_SIZE[size].maxAmount;
    if(tileIndex < currentTileCount){
      return size;
    }
  }
  return tileSize;
};

/*
* Reduce tile size
* This is checking all the tile size and look for the next area smaller then the current one.
* To find the area we just ened to multiply the col and row (Constants.TILE_SIZE[size].col * Constants.TILE_SIZE[size].row)
* @param {string} currentTileSize - big, medium, small, ect.
*/
Tiles.prototype.reduceTileSize = function(currentTileSize) {
  let currentTile = Constants.TILE_SIZE[currentTileSize];
  let currentTileArea = currentTile.col * currentTile.row;
  let nextSize = null; // This will return null if no smaller tile are found.
  for (let size in Constants.TILE_SIZE) {
    let nextTileArea = Constants.TILE_SIZE[size].col * Constants.TILE_SIZE[size].row;
    if (nextTileArea < currentTileArea) {
      return size;
    }
  }
  return nextSize;
};

/*
* Get max tile count
*/
Tiles.prototype.getMaxTileCount = function() {
  let maxTileCount = 0;
  for (let size in Constants.TILE_SIZE) {
    maxTileCount = maxTileCount + Constants.TILE_SIZE[size].maxAmount;
  }
  return maxTileCount;
};

/*
* Build tiles
*/
Tiles.prototype.buildTiles = function() {
  let size = null;
  let tileCount = 0;
  let maxTile = this.getMaxTileCount();

  this.tiles.forEach((tile, index) => {
    if(this.coords.free.length > 0 && tileCount < maxTile) {

      tile.size = this.getNextTileSize(tileCount);
      let availableAreaCoords = null;

      // If no space were found that mean the tile is to big.
      // Need to size it down a bit
      let findNextAvailableAreaCoords = function() {
        tile.size = this.reduceTileSize(tile.size);
        if(!tile.size) {
          return undefined;
        }
        let availableAreaCoords = this.getNewTileArea(tile.size);
        if(!availableAreaCoords){
          return findNextAvailableAreaCoords();
        }
        return availableAreaCoords;
      }.bind(this);

      // Check if we found a place for the tile
      availableAreaCoords = findNextAvailableAreaCoords();
      // Just making sure we have space for this tile.
      // We wont need this condition after I make a recursion for the downsizing tile function
      if(availableAreaCoords){
        tileCount++;
        tile.key = index;
        tile.target = availableAreaCoords[0]; //Take the first one in the array. They are already shoveled
        tile.col = Constants.TILE_SIZE[tile.size].col;
        tile.row = Constants.TILE_SIZE[tile.size].row;
        let myTile = new Tile(this, tile);

        // Update free & taken coords
        let tileOccupationCoords = this.getOccupationFromCoord({totalCol: tile.col, totalRow: tile.row, coord: tile.target});
        tileOccupationCoords.forEach(coords => {
          this.putFreeCoorToTakenCoor(coords);
        });
        this.tileQueue.push(myTile.getTileInfos());
      }else{
        // no tile added to the queue because we did not find the space for it
      }
    }
  });
};

/**
* Tile
* @param {object} grid
* @param {object} params
*/
function Tile(grid, params) {
  this.grid = grid;
  this.params = params;
}

/*
* Get tile infos
*/
Tile.prototype.getTileInfos = function() {
  return {
    size: this.params.size,
    x: this.params.target.x * this.grid.tileWidth * 100 / this.grid.gridWidth,
    y: this.params.target.y * this.grid.tileHeight * 100 / this.grid.gridHeight,
    width: (this.params.col * 100 / this.grid.col) - this.grid.gridWidthSpacer,
    height: (this.params.row * 100 / this.grid.row) - this.grid.gridHeightSpacer,
    id: this.params.key
  };
};

/**
* Moza
*/
class Moza extends Tiles {
  /*
  * Build
  * @param {string} el
  * @param {number} col
  * @param {number} row
  */
  build(params) {
    this.buildGrid(params);
    // Build the tiles. At this point we will have the size and position of all the tiles.
    this.buildTiles();
    // This will parse the
    this.showTile(params);
  }
}

global.Moza = Moza;
