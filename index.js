function dist(x1, y1, x2, y2, type) {
  switch (type) {
    case "euclidean":
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    case "manhattan":
      return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    case "chebyshev":
      console.log("chebyshev");
      return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    default:
      console.log("chebyshev");
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}

function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function color(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

function random(max) {
  return Math.random() * max;
}

function rect(x, y, width, height) {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillRect(x, y, width, height);
}

class Tile {
  constructor(x, y, rows, cols) {
    this.x = x;
    this.y = y;
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.neighbors = [];
    this.color = "blue";
    this.previous = undefined;
    this.wall = false;
    this.cols = cols;
    this.rows = rows;

    // if (random(1) < 0.2) {
    //   this.wall = true;
    // }

    this.addNeighbors = function (grid) {
      let i = this.x;
      let j = this.y;
      cols = this.cols;
      rows = this.rows;
      if (i < cols - 1) {
        this.neighbors.push(grid[i + 1][j]);
      }
      if (i > 0) {
        this.neighbors.push(grid[i - 1][j]);
      }
      if (j < rows - 1) {
        this.neighbors.push(grid[i][j + 1]);
      }
      if (j > 0) {
        this.neighbors.push(grid[i][j - 1]);
      }

      if (i > 0 && j > 0) {
        this.neighbors.push(grid[i - 1][j - 1]);
      }
      if (i < cols - 1 && j > 0) {
        this.neighbors.push(grid[i + 1][j - 1]);
      }
      if (i > 0 && j < rows - 1) {
        this.neighbors.push(grid[i - 1][j + 1]);
      }
      if (i < cols - 1 && j < rows - 1) {
        this.neighbors.push(grid[i + 1][j + 1]);
      }
    };
  }
}

class Grid {
  constructor(width, height) {
    this.cols = width;
    this.rows = height;
    this.width = width;
    this.height = width;
    this.w;
    this.h;
    this.tiles = [];
    this.canvas;
    this.initializeTiles();
    this.initializeCanvas();
    this.inititalizeNeighbors();
  }

  initializeTiles() {
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y].push(new Tile(y, x, this.cols, this.rows));
      }
    }
  }

  initializeCanvas() {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      console.log("canvas exists");
      this.canvas = canvas;
      let ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      this.canvas = document.createElement("canvas");
      let ctx = this.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.width * 10, this.height * 10);
    }
    this.canvas.width = this.width * 10;
    this.canvas.height = this.height * 10;
    document.body.appendChild(this.canvas);
    this.w = this.canvas.width / this.width;
    this.h = this.canvas.height / this.height;
  }

  inititalizeNeighbors() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let grid = this.tiles;
        grid[j][i].addNeighbors(this.tiles);
      }
    }
  }

  getTile(x, y) {
    return this.tiles[y][x];
  }

  setTile(x, y, value) {
    const tile = this.getTile(x, y);
    tile.value = value;
  }

  showTile(x, y, color) {
    const tile = this.getTile(x, y);
    const ctx = this.canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(tile.x * 10, tile.y * 10, 10, 10);
  }

  draw() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.tiles.forEach((tile) => {
      ctx.fillStyle = tile.value === 0 ? "white" : "black";
      ctx.fillRect(tile.x * 10, tile.y * 10, 10, 10);
    });
  }
}

class PathFinder {
  constructor(grid, type) {
    this.grid = grid;
    this.openSet = [this.grid.getTile(0, 0)];
    this.closedSet = [];
    this.start = this.grid.getTile(0, 0);
    this.end = this.grid.getTile(
      Math.floor(this.grid.width - 1),
      Math.floor(random(this.grid.height - 1))
    );
    this.path = [];
    this.search = this.search.bind(this);
    this.draw = this.draw.bind(this);
    this.distance = type;
    this.end.wall = false;
    this.reset = this.reset.bind(this);
    this.getPath = this.getPath.bind(this);
  }

  reset(distance) {
    this.openSet = [this.grid.getTile(0, 0)];
    this.closedSet = [];
    this.start = this.grid.getTile(0, 0);
    this.end = this.end;
    this.path = [];
    this.end.wall = false;
    this.distance = distance;
  }

  getPath() {
    return this.path.length;
  }

  heuristic(a, b) {
    let d = dist(a.x, a.y, b.x, b.y, this.distance);
    return d;
  }

  search() {
    if (this.openSet.length > 0) {
      let winner = 0;
      for (let i = 0; i < this.openSet.length; i++) {
        if (this.openSet[i].f < this.openSet[winner].f) {
          winner = i;
        }
      }
      let current = this.openSet[winner];

      if (current === this.end) {
        this.path = [];
        let temp = current;
        this.path.push(temp);
        while (temp.previous) {
          this.path.push(temp.previous);
          temp = temp.previous;
        }
        console.log(this.path.length);
        console.log("DONE!");
        return true;
      }
      this.path = [];
      let temp = current;
      this.path.push(temp);
      while (temp.previous) {
        this.path.push(temp.previous);
        temp = temp.previous;
      }

      removeFromArray(this.openSet, current);
      this.closedSet.push(current);

      let neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (!this.closedSet.includes(neighbor) && !neighbor.wall) {
          let tempG = current.g + 1;

          let newPath = false;
          if (this.openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            this.openSet.push(neighbor);
          }

          if (newPath) {
            neighbor.h = this.heuristic(neighbor, this.end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }
    } else {
      // show all walls
      this.showWalls();
      console.log("no solution");
      return true;
    }
  }

  showWalls() {
    for (let i = 0; i < this.grid.width; i++) {
      for (let j = 0; j < this.grid.height; j++) {
        if (this.grid.getTile(i, j).wall) {
          this.grid.showTile(i, j, color(255, 255, 200));
        }
      }
    }
  }

  draw() {
    for (let i = 0; i < this.grid.cols; i++) {
      for (let j = 0; j < this.grid.rows; j++) {
        this.grid.showTile(j, i, color(0, 0, 0));
        if (this.grid.getTile(i, j).wall) {
          this.grid.showTile(j, i, color(255, 255, 255));
        }
        if (this.grid.getTile(i, j) === this.end) {
          this.grid.showTile(j, i, color(255, 0, 0));
        }
      }
    }

    for (let i = 0; i < this.closedSet.length; i++) {
      if (this.closedSet[i].wall) {
        this.grid.showTile(
          this.closedSet[i].x,
          this.closedSet[i].y,
          color(0, 0, 200)
        );
      } else {
        if (this.closedSet[i].wall) {
          this.grid.showTile(
            this.closedSet[i].x,
            this.closedSet[i].y,
            color(255, 255, 255)
          );
        } else {
          this.grid.showTile(
            this.closedSet[i].x,
            this.closedSet[i].y,
            color(255, 0, 0)
          );
        }
      }
    }

    for (let i = 0; i < this.openSet.length; i++) {
      this.grid.showTile(
        this.openSet[i].x,
        this.openSet[i].y,
        color(0, 255, 0)
      );
    }

    this.path.forEach((tile) => {
      this.grid.showTile(tile.x, tile.y, color(0, 0, 255));
    });
  }
}

function main() {
  let start = performance.now();
  let timeElement = document.getElementById("time");
  let pathElement = document.getElementById("path");
  const canvas = document.getElementById("canvas");
  const distance = document.getElementById("distance");
  distance.onchange = null;

  if (canvas) {
    // remove canvas
    canvas.remove();
  }

  function loop() {
    if (pathFinder.search()) {
      let end = performance.now();
      timeElement.innerHTML = `Time: ${Math.floor(end - start)} ms`;
      pathElement.innerHTML = `Path: ${pathFinder.getPath()}`;
      pathFinder.draw();
      return;
    }
    pathFinder.draw();
    setTimeout(loop, 1);
  }
  const grid = new Grid(25, 25);
  console.log(grid);
  const pathFinder = new PathFinder(
    grid,
    distance.options[distance.selectedIndex].value
  );
  loop();
  distance.onchange = (e) => {
    start = performance.now();

    pathFinder.reset(e.target.value);
    loop();
  };
  return pathFinder;
}

const button = document.getElementById("main");
button.addEventListener("click", main);
