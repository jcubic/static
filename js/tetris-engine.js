(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tetris = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Shape = require('./shape').Shape;

var ShapeDimension = require('./shape').ShapeDimension;

var tetraShapes = require('./tetra-shapes');
/**
 * Implements the engine of a game
 */


var Engine = /*#__PURE__*/function () {
  /**
   * Initializing new area
   * @param {number} width is the width of the field of the game in squares
   * @param {number} height is the height of the field of the game in squares
   * @param {function} renderHandle The method that will be runned every time 
   *                   when game state will be changed. Receives game render data.
   * @param {Array} default heap for a game
   */
  function Engine() {
    var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 15;
    var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
    var renderHandle = arguments.length > 2 ? arguments[2] : undefined;
    var defaultHeap = arguments.length > 3 ? arguments[3] : undefined;
    var additionalShapes = arguments.length > 4 ? arguments[4] : undefined;

    _classCallCheck(this, Engine);

    if (width <= 0 || height <= 0) throw 'Size parameters of the game field are incorrect';
    this.width = width;
    this.height = height;
    this._shapesSet = {};

    for (var key in tetraShapes) {
      this._shapesSet[key] = tetraShapes[key];
    }

    if (additionalShapes) for (var _key in additionalShapes) {
      this._shapesSet[_key] = additionalShapes[_key];
    }
    this._gameStatus = GAME_STATUS.INIT;
    this._statistic = {
      countShapesFalled: 0,
      countShapesFalledByType: {},
      countLinesReduced: 0,
      countDoubleLinesReduced: 0,
      countTrippleLinesReduced: 0,
      countQuadrupleLinesReduced: 0
    };
    this._heap = [];

    if (defaultHeap && defaultHeap.length && defaultHeap[0].length) {
      for (var y = 0; y < defaultHeap.length; y++) {
        var row = [];

        for (var x = 0; x < this.width; x++) {
          row.push({
            val: 0
          });
        }

        this._heap.push(row);
      }

      var inversedDefaultHeap = defaultHeap.slice().reverse();

      for (var _y = 0; _y < inversedDefaultHeap.length && _y < this.height; _y++) {
        var _row = inversedDefaultHeap[_y];

        for (var _x = 0; _x < _row.length && _x < this.width; _x++) {
          this._heap[_y][_x].val = inversedDefaultHeap[_y][_x];
        }
      }
    }

    this._checkHeapForReduce();

    if (renderHandle) {
      renderHandle(this.state);
      this._renderHandle = renderHandle;
    }
  }
  /**
   * Creates a new Shape
   */


  _createClass(Engine, [{
    key: "_newFigure",
    value: function _newFigure() {
      this._shape = this._nextShape ? this._nextShape : new Shape(this._shapesSet, parseInt(this.width / 2 - 3), this.height);
      this._nextShape = new Shape(this._shapesSet, parseInt(this.width / 2 - 3), this.height);
      var countFalledShapesByThisKind = this._statistic.countShapesFalledByType[this._shape.name];
      if (!countFalledShapesByThisKind) this._statistic.countShapesFalledByType[this._shape.name] = 1;else this._statistic.countShapesFalledByType[this._shape.name]++;
      this._statistic.countShapesFalled++;
    }
    /**
     * Running a game or turn off a pause mode
     */

  }, {
    key: "start",
    value: function start() {
      if (this._gameStatus !== GAME_STATUS.INIT && this._gameStatus !== GAME_STATUS.PAUSE) return false;

      if (this._gameStatus == GAME_STATUS.INIT) {
        this._newFigure();

        this._gameStatus = GAME_STATUS.WORK;
        return true;
      }

      if (this._gameStatus == GAME_STATUS.PAUSE) {
        this._gameStatus = GAME_STATUS.WORK;
      }
    }
    /**
     * Turn on a pause mode
     */

  }, {
    key: "pause",
    value: function pause() {
      if (this._gameStatus !== GAME_STATUS.WORK) return false;
      this._gameStatus = GAME_STATUS.PAUSE;
      return true;
    }
  }, {
    key: "moveLeft",
    value: function moveLeft() {
      if (this._gameStatus !== GAME_STATUS.WORK) return;
      if (!this._canShapeMove(0, -1)) return;
      this._shape.position.X--;

      this._renderHandle(this.state);
    }
  }, {
    key: "moveRight",
    value: function moveRight() {
      if (this._gameStatus !== GAME_STATUS.WORK) return;
      if (!this._canShapeMove(0, 1)) return;
      this._shape.position.X++;

      this._renderHandle(this.state);
    }
  }, {
    key: "moveUp",
    value: function moveUp() {
      if (this._gameStatus !== GAME_STATUS.WORK) return;
      if (!this._canShapeMove(1, 0)) return;
      this._shape.position.Y++;

      this._renderHandle(this.state);
    }
  }, {
    key: "moveDown",
    value: function moveDown() {
      if (this._gameStatus !== GAME_STATUS.WORK) return;

      if (!this._canShapeMove(-1, 0)) {
        if (!this._addShapeToHeap()) {
          this._gameStatus = GAME_STATUS.OVER;

          this._renderHandle(this.state);
        }

        return;
      }

      this._shape.position.Y--;

      this._renderHandle(this.state);
    }
  }, {
    key: "_addShapeToHeap",
    value: function _addShapeToHeap() {
      var newRowForHeap = [];

      for (var i = 0; i < this.width; i++) {
        newRowForHeap.push({
          val: 0
        });
      }

      for (var y = ShapeDimension - 1; y >= 0; y--) {
        var row = this._shape.body[y];

        for (var x = 0; x < ShapeDimension; x++) {
          var cell = row[x];

          if (cell) {
            var areaIndexY = this._getAreaIndexYFromShape(y);

            if (areaIndexY >= this.height) {
              //game over :)
              return false;
            }

            while (areaIndexY >= this._heap.length) {
              this._heap.push(newRowForHeap.slice());
            }

            var areaIndexX = this._getAreaIndexXFromShape(x);

            this._heap[areaIndexY][areaIndexX] = {
              val: 1,
              "class": this._shape.name
            };
          }
        }
      }

      this._checkHeapForReduce();

      this._newFigure();

      this._renderHandle(this.state);

      return true;
    }
  }, {
    key: "_checkHeapForReduce",
    value: function _checkHeapForReduce() {
      var linesToRemove = [];

      for (var y = this._heap.length - 1; y >= 0; y--) {
        var row = this._heap[y];
        var isThereEmptySquare = false;

        for (var x = 0; x < row.length; x++) {
          if (!this._heap[y][x].val) {
            isThereEmptySquare = true;
            break;
          }
        }

        if (!isThereEmptySquare) linesToRemove.push(y);
      }

      var newHeap = [];

      for (var _y2 = 0; _y2 < this._heap.length; _y2++) {
        if (linesToRemove.indexOf(_y2) == -1) newHeap.push(this._heap[_y2]);
      }

      this._statistic.countLinesReduced += linesToRemove.length;

      switch (linesToRemove.length) {
        case 2:
          this._statistic.countDoubleLinesReduced++;
          break;

        case 3:
          this._statistic.countTrippleLinesReduced++;
          break;

        case 4:
          this._statistic.countQuadrupleLinesReduced++;
          break;
      }

      this._heap = newHeap;
    }
  }, {
    key: "rotate",
    value: function rotate() {
      if (this._gameStatus !== GAME_STATUS.WORK) return;
      if (!this._canShapeMove(0, 0, this._shape.getRotatedBody())) return;

      this._shape.rotate();

      this._renderHandle(this.state);
    }
  }, {
    key: "rotateBack",
    value: function rotateBack() {
      if (this._gameStatus !== GAME_STATUS.WORK) return;
      if (!this._canShapeMove(0, 0, this._shape.getRotatedBackBody())) return;

      this._shape.rotateBack();

      this._renderHandle(this.state);
    }
  }, {
    key: "_getShapeIndexX",
    value: function _getShapeIndexX(x) {
      return x - this._shape.position.X;
    }
  }, {
    key: "_getShapeIndexY",
    value: function _getShapeIndexY(y) {
      return this._shape.position.Y + (ShapeDimension - 1) - y;
    }
  }, {
    key: "_getAreaIndexXFromShape",
    value: function _getAreaIndexXFromShape(shapeX) {
      var delta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return shapeX + this._shape.position.X + delta;
    }
  }, {
    key: "_getAreaIndexYFromShape",
    value: function _getAreaIndexYFromShape(shapeY) {
      var delta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return this._shape.position.Y + (ShapeDimension - 1) - shapeY + delta;
    }
    /**
     * Specifies that can a shape move. 
     * If new coordinates of shape overlap with coordinates of heap 
     * or are outside the game area the shape can't move
     * @param {*} deltaY specifies vertical moving distance
     * @param {*} deltaX specifies horizontal moving distance
     * @param {*} shapeBody specifies changed body of a shape, for example rotated body
     */

  }, {
    key: "_canShapeMove",
    value: function _canShapeMove(deltaY, deltaX, shapeBody) {
      if (!shapeBody) shapeBody = this._shape.body;

      for (var y = 0; y < shapeBody.length; y++) {
        var row = shapeBody[y];

        var areaIndexY = this._getAreaIndexYFromShape(y, deltaY);

        for (var x = 0; x < row.length; x++) {
          var cell = row[x];

          if (cell) {
            var areaIndexX = this._getAreaIndexXFromShape(x, deltaX); //check will the shape go over the walls and the ground


            if (areaIndexY < 0 || areaIndexX < 0 || areaIndexX >= this.width) return false;
            if (this._isHeapSquare(areaIndexY, areaIndexX)) return false;
          }
        }
      }

      return true;
    }
  }, {
    key: "_isShapeSquare",
    value: function _isShapeSquare(y, x) {
      if (!this._shape || !this._shape.body) return false;

      var row = this._shape.body[this._getShapeIndexY(y)];

      return row && row[this._getShapeIndexX(x)];
    }
  }, {
    key: "_isHeapSquare",
    value: function _isHeapSquare(y, x) {
      if (!this._heap) return false;
      return this._heap[y] && this._heap[y][x].val;
    }
  }, {
    key: "_getHeapClass",
    value: function _getHeapClass(y, x) {
      if (!this._heap) return;
      if (!this._heap[y] || !this._heap[y][x].val) return;
      return this._heap[y][x]["class"];
    }
  }, {
    key: "_getBody",
    value: function _getBody() {
      var body = [];

      for (var y = this.height - 1; y >= 0; y--) {
        var row = [];

        for (var x = 0; x < this.width; x++) {
          var isHeap = this._isHeapSquare(y, x);

          var isShape = this._isShapeSquare(y, x);

          var val = isHeap ? 2 : isShape ? 1 : 0;
          row.push({
            val: val,
            cssClasses: [isShape ? 'shape' : null, isHeap ? 'heap' : null, isShape ? this._shape.name + '' : null, isHeap ? this._getHeapClass(y, x) : null]
          });
        }

        body.push(row);
      }

      return body;
    }
  }, {
    key: "state",
    get: function get() {
      return {
        gameStatus: this._gameStatus,
        body: this._getBody(),
        shapeName: this._shape ? this._shape.name : null,
        nextShape: {
          name: this._nextShape ? this._nextShape.name : null,
          body: this._nextShape ? this._nextShape.body : null
        },
        statistic: this._statistic
      };
    }
  }]);

  return Engine;
}();
/**
 * Enum represents status of a game
 * 
 * INIT - game was not started
 * WORK - game is running
 * PAUSE - game was temporary stopped
 * OVER - game was finished
 */


var GAME_STATUS = {
  INIT: 0,
  WORK: 1,
  PAUSE: 2,
  OVER: 3
};
module.exports = Engine;

},{"./shape":3,"./tetra-shapes":4}],2:[function(require,module,exports){
"use strict";

var Engine = require('./engine');

var tetraShapes = require('./tetra-shapes');

module.exports = {
  Engine: Engine,
  tetraShapes: tetraShapes
};

},{"./engine":1,"./tetra-shapes":4}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Max dimension of every shape
 */
var ShapeDimension = 5;
/**
 * Implements a falling shape
 */

var Shape = /*#__PURE__*/function () {
  function Shape(shapesSet) {
    var X = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var Y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 12;

    _classCallCheck(this, Shape);

    if (!shapesSet) console.error('Set of shapes was not setted!');
    this._shape = this._selectNextShape(shapesSet);
    this.position = {
      X: X,
      Y: Y
    };

    this._calculateProperties();
  }
  /**
   * Selecting next shape from the available set of shapes
   * @private
   */


  _createClass(Shape, [{
    key: "_selectNextShape",
    value: function _selectNextShape(shapesSet) {
      var count = 0;
      var selectedShape;

      for (var prop in shapesSet) {
        if (Math.random() < 1 / ++count) selectedShape = prop;
      }

      this.name = selectedShape;
      return shapesSet[selectedShape];
    }
    /**
     * Calculating all properties that change when a shape is rotated
     * @private
     */

  }, {
    key: "_calculateProperties",
    value: function _calculateProperties() {
      this._calculatePaddings();
    }
    /**
     * Calculating paddings
     */

  }, {
    key: "_calculatePaddings",
    value: function _calculatePaddings() {
      var paddingLeft = ShapeDimension;
      var paddingRight = ShapeDimension;
      var paddingTop = -1;
      var paddingBottom = -1;

      for (var y = 0; y < ShapeDimension; y++) {
        for (var x = 0; x < ShapeDimension; x++) {
          if (this._shape[y][x]) {
            if (paddingLeft > x) paddingLeft = x;
            if (paddingTop < 0) paddingTop = y;
          }
        }
      }

      for (var _y = ShapeDimension - 1; _y >= 0; _y--) {
        for (var _x = ShapeDimension - 1; _x >= 0; _x--) {
          if (this._shape[_y][_x]) {
            if (paddingRight > ShapeDimension - 1 - _x) paddingRight = ShapeDimension - 1 - _x;
            if (paddingBottom < 0) paddingBottom = ShapeDimension - 1 - _y;
          }
        }
      }

      this._paddingLeft = paddingLeft;
      this._paddingRight = paddingRight;
      this._paddingTop = paddingTop;
      this._paddingBottom = paddingBottom;
    }
    /**
     * rotating a shape clockwise
     * @public
     */

  }, {
    key: "rotate",
    value: function rotate() {
      this._shape = this.getRotatedBody();

      this._calculateProperties();
    }
  }, {
    key: "getRotatedBody",
    value: function getRotatedBody() {
      var newShape = [];

      for (var x = 0; x < ShapeDimension; x++) {
        var newRow = [];

        for (var y = ShapeDimension - 1; y >= 0; y--) {
          newRow.push(this._shape[y][x]);
        }

        newShape.push(newRow);
      }

      return newShape;
    }
    /**
     * rotating a shape counterclockwise
     * @public
     */

  }, {
    key: "rotateBack",
    value: function rotateBack() {
      this._shape = this.getRotatedBackBody();

      this._calculateProperties();
    }
  }, {
    key: "getRotatedBackBody",
    value: function getRotatedBackBody() {
      var newShape = [];

      for (var x = ShapeDimension - 1; x >= 0; x--) {
        var newRow = [];

        for (var y = 0; y < ShapeDimension; y++) {
          newRow.push(this._shape[y][x]);
        }

        newShape.push(newRow);
      }

      return newShape;
    }
    /**
     * getting actual shape body
     * @public
     */

  }, {
    key: "body",
    get: function get() {
      return this._shape;
    }
    /**
     * getting top padding for shape relatively shape's border
     * @public
     */

  }, {
    key: "paddingTop",
    get: function get() {
      return this._paddingTop;
    }
    /**
      * getting bottom padding for shape relatively shape's border
      * @public
      */

  }, {
    key: "paddingBottom",
    get: function get() {
      return this._paddingBottom;
    }
    /**
      * getting right padding for shape relatively shape's border
      * @public
      */

  }, {
    key: "paddingRight",
    get: function get() {
      return this._paddingRight;
    }
    /**
      * getting left padding for shape relatively shape's border
      * @public
      */

  }, {
    key: "paddingLeft",
    get: function get() {
      return this._paddingLeft;
    }
  }]);

  return Shape;
}();

module.exports = {
  Shape: Shape,
  ShapeDimension: ShapeDimension
};

},{}],4:[function(require,module,exports){
"use strict";

module.exports = {
  IShape: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  ZShape: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 1, 0], [0, 0, 0, 0, 0]],
  SShape: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 1, 0], [0, 1, 1, 0, 0], [0, 0, 0, 0, 0]],
  LShape: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 1, 0, 0, 0], [0, 0, 0, 0, 0]],
  JShape: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 0, 0]],
  OShape: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 0, 0], [0, 1, 1, 0, 0], [0, 0, 0, 0, 0]],
  TShape: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]]
};

},{}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92MTQuMTYuMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy90ZXRyaXMtZW5naW5lL2Rpc3QvZW5naW5lLmpzIiwibm9kZV9tb2R1bGVzL3RldHJpcy1lbmdpbmUvZGlzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90ZXRyaXMtZW5naW5lL2Rpc3Qvc2hhcGUuanMiLCJub2RlX21vZHVsZXMvdGV0cmlzLWVuZ2luZS9kaXN0L3RldHJhLXNoYXBlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFQLFNBQU8sQ0FBUCxDQUFaLEtBQUE7O0FBQ0EsSUFBSSxjQUFjLEdBQUcsT0FBTyxDQUFQLFNBQU8sQ0FBUCxDQUFyQixjQUFBOztBQUVBLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBekIsZ0JBQXlCLENBQXpCO0FBRUE7QUFDQTtBQUNBOzs7SUFFQSxNO0FBRUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFLG9CQUFrRjtBQUFBLFFBQXRFLEtBQXNFLHVFQUF2RSxFQUF1RTtBQUFBLFFBQTFELE1BQTBELHVFQUF2RSxFQUF1RTtBQUFBLFFBQXZFLFlBQXVFO0FBQUEsUUFBdkUsV0FBdUU7QUFBQSxRQUF2RSxnQkFBdUU7O0FBQUE7O0FBQ2hGLFFBQUcsS0FBSyxJQUFMLENBQUEsSUFBYyxNQUFNLElBQXZCLENBQUEsRUFDRSxNQUFBLGlEQUFBO0FBRUYsU0FBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLFNBQUEsTUFBQSxHQUFBLE1BQUE7QUFFQSxTQUFBLFVBQUEsR0FBQSxFQUFBOztBQUNBLFNBQUksSUFBSixHQUFBLElBQUEsV0FBQTtBQUNFLFdBQUEsVUFBQSxDQUFBLEdBQUEsSUFBdUIsV0FBVyxDQUFsQyxHQUFr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Q0FDTCxDQURLLEVBRUwsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBRkssQ0FFTCxDQUZLLEVBR0wsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBSEssQ0FHTCxDQUhLLEVBSUwsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBSkssQ0FJTCxDQUpLLEVBS0wsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBekNVLENBeUNWLENBTEssQ0FwQ0s7QUEyQ2IsRUFBQSxNQUFNLEVBQUUsQ0FDTCxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFESyxDQUNMLENBREssRUFFTCxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFGSyxDQUVMLENBRkssRUFHTCxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFISyxDQUdMLENBSEssRUFJTCxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFKSyxDQUlMLENBSkssRUFLTCxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFMSyxDQUtMLENBTEs7QUEzQ0ssQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJsZXQgU2hhcGUgPSByZXF1aXJlKCcuL3NoYXBlJykuU2hhcGVcclxubGV0IFNoYXBlRGltZW5zaW9uID0gcmVxdWlyZSgnLi9zaGFwZScpLlNoYXBlRGltZW5zaW9uXHJcblxyXG5sZXQgdGV0cmFTaGFwZXMgPSByZXF1aXJlKCcuL3RldHJhLXNoYXBlcycpXHJcblxyXG4vKipcclxuICogSW1wbGVtZW50cyB0aGUgZW5naW5lIG9mIGEgZ2FtZVxyXG4gKi9cclxuXHJcbmNsYXNzIEVuZ2luZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemluZyBuZXcgYXJlYVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBpcyB0aGUgd2lkdGggb2YgdGhlIGZpZWxkIG9mIHRoZSBnYW1lIGluIHNxdWFyZXNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IGlzIHRoZSBoZWlnaHQgb2YgdGhlIGZpZWxkIG9mIHRoZSBnYW1lIGluIHNxdWFyZXNcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSByZW5kZXJIYW5kbGUgVGhlIG1ldGhvZCB0aGF0IHdpbGwgYmUgcnVubmVkIGV2ZXJ5IHRpbWUgXHJcbiAgICogICAgICAgICAgICAgICAgICAgd2hlbiBnYW1lIHN0YXRlIHdpbGwgYmUgY2hhbmdlZC4gUmVjZWl2ZXMgZ2FtZSByZW5kZXIgZGF0YS5cclxuICAgKiBAcGFyYW0ge0FycmF5fSBkZWZhdWx0IGhlYXAgZm9yIGEgZ2FtZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKHdpZHRoID0gMTUsIGhlaWdodCA9IDIwLCByZW5kZXJIYW5kbGUsIGRlZmF1bHRIZWFwLCBhZGRpdGlvbmFsU2hhcGVzKSB7XHJcbiAgICBpZih3aWR0aCA8PSAwIHx8IGhlaWdodCA8PSAwKVxyXG4gICAgICB0aHJvdyAnU2l6ZSBwYXJhbWV0ZXJzIG9mIHRoZSBnYW1lIGZpZWxkIGFyZSBpbmNvcnJlY3QnXHJcblxyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgdGhpcy5fc2hhcGVzU2V0ID0ge307XHJcbiAgICBmb3IobGV0IGtleSBpbiB0ZXRyYVNoYXBlcylcclxuICAgICAgdGhpcy5fc2hhcGVzU2V0W2tleV0gPSB0ZXRyYVNoYXBlc1trZXldO1xyXG4gICAgICBcclxuICAgIGlmKGFkZGl0aW9uYWxTaGFwZXMpXHJcbiAgICAgIGZvcihsZXQga2V5IGluIGFkZGl0aW9uYWxTaGFwZXMpXHJcbiAgICAgICAgdGhpcy5fc2hhcGVzU2V0W2tleV0gPSBhZGRpdGlvbmFsU2hhcGVzW2tleV07XHJcblxyXG4gICAgdGhpcy5fZ2FtZVN0YXR1cyA9IEdBTUVfU1RBVFVTLklOSVQ7ICAgIFxyXG5cclxuICAgIHRoaXMuX3N0YXRpc3RpYyA9IHtcclxuICAgICAgY291bnRTaGFwZXNGYWxsZWQ6IDAsXHJcbiAgICAgIGNvdW50U2hhcGVzRmFsbGVkQnlUeXBlOiB7IH0sXHJcbiAgICAgIGNvdW50TGluZXNSZWR1Y2VkOiAwLFxyXG4gICAgICBjb3VudERvdWJsZUxpbmVzUmVkdWNlZDogMCxcclxuICAgICAgY291bnRUcmlwcGxlTGluZXNSZWR1Y2VkOiAwLFxyXG4gICAgICBjb3VudFF1YWRydXBsZUxpbmVzUmVkdWNlZDogMFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2hlYXAgPSBbXTtcclxuICAgIGlmKGRlZmF1bHRIZWFwICYmIGRlZmF1bHRIZWFwLmxlbmd0aCAmJiBkZWZhdWx0SGVhcFswXS5sZW5ndGgpIHtcclxuXHJcbiAgICAgIGZvcihsZXQgeSA9IDA7IHkgPCBkZWZhdWx0SGVhcC5sZW5ndGg7IHkrKykge1xyXG4gICAgICAgIGxldCByb3cgPSBbXTtcclxuICAgICAgICBmb3IobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7IFxyXG4gICAgICAgICAgcm93LnB1c2goe1xyXG4gICAgICAgICAgICB2YWw6IDBcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oZWFwLnB1c2gocm93KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGludmVyc2VkRGVmYXVsdEhlYXAgPSBkZWZhdWx0SGVhcC5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgICAgZm9yKGxldCB5ID0gMDsgeSA8IGludmVyc2VkRGVmYXVsdEhlYXAubGVuZ3RoICYmIHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgbGV0IHJvdyA9IGludmVyc2VkRGVmYXVsdEhlYXBbeV07XHJcbiAgICAgICAgZm9yKGxldCB4ID0gMDsgeCA8IHJvdy5sZW5ndGggJiYgeCA8IHRoaXMud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgdGhpcy5faGVhcFt5XVt4XS52YWwgPSBpbnZlcnNlZERlZmF1bHRIZWFwW3ldW3hdXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY2hlY2tIZWFwRm9yUmVkdWNlKCk7XHJcblxyXG4gICAgaWYocmVuZGVySGFuZGxlKSB7XHJcbiAgICAgIHJlbmRlckhhbmRsZSh0aGlzLnN0YXRlKTtcclxuICAgICAgdGhpcy5fcmVuZGVySGFuZGxlID0gcmVuZGVySGFuZGxlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBTaGFwZVxyXG4gICAqL1xyXG4gIF9uZXdGaWd1cmUoKSB7XHJcbiAgICB0aGlzLl9zaGFwZSA9IHRoaXMuX25leHRTaGFwZSA/IHRoaXMuX25leHRTaGFwZSA6IG5ldyBTaGFwZSh0aGlzLl9zaGFwZXNTZXQsIHBhcnNlSW50KHRoaXMud2lkdGggLyAyIC0gMyksIHRoaXMuaGVpZ2h0KTtcclxuICAgIHRoaXMuX25leHRTaGFwZSA9IG5ldyBTaGFwZSh0aGlzLl9zaGFwZXNTZXQsIHBhcnNlSW50KHRoaXMud2lkdGggLyAyIC0gMyksIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICBsZXQgY291bnRGYWxsZWRTaGFwZXNCeVRoaXNLaW5kID0gdGhpcy5fc3RhdGlzdGljLmNvdW50U2hhcGVzRmFsbGVkQnlUeXBlW3RoaXMuX3NoYXBlLm5hbWVdO1xyXG4gICAgaWYoIWNvdW50RmFsbGVkU2hhcGVzQnlUaGlzS2luZClcclxuICAgICAgdGhpcy5fc3RhdGlzdGljLmNvdW50U2hhcGVzRmFsbGVkQnlUeXBlW3RoaXMuX3NoYXBlLm5hbWVdID0gMTtcclxuICAgIGVsc2UgXHJcbiAgICAgIHRoaXMuX3N0YXRpc3RpYy5jb3VudFNoYXBlc0ZhbGxlZEJ5VHlwZVt0aGlzLl9zaGFwZS5uYW1lXSsrO1xyXG5cclxuICAgIHRoaXMuX3N0YXRpc3RpYy5jb3VudFNoYXBlc0ZhbGxlZCsrO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUnVubmluZyBhIGdhbWUgb3IgdHVybiBvZmYgYSBwYXVzZSBtb2RlXHJcbiAgICovXHJcbiAgc3RhcnQoKSB7XHJcbiAgICBpZih0aGlzLl9nYW1lU3RhdHVzICE9PSBHQU1FX1NUQVRVUy5JTklUICYmIHRoaXMuX2dhbWVTdGF0dXMgIT09IEdBTUVfU1RBVFVTLlBBVVNFKVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgaWYodGhpcy5fZ2FtZVN0YXR1cyA9PSBHQU1FX1NUQVRVUy5JTklUKSB7XHJcbiAgICAgIHRoaXMuX25ld0ZpZ3VyZSgpO1xyXG4gICAgICB0aGlzLl9nYW1lU3RhdHVzID0gR0FNRV9TVEFUVVMuV09SSztcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKHRoaXMuX2dhbWVTdGF0dXMgPT0gR0FNRV9TVEFUVVMuUEFVU0UpIHtcclxuICAgICAgdGhpcy5fZ2FtZVN0YXR1cyA9IEdBTUVfU1RBVFVTLldPUks7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUdXJuIG9uIGEgcGF1c2UgbW9kZVxyXG4gICAqL1xyXG4gIHBhdXNlKCkge1xyXG4gICAgaWYodGhpcy5fZ2FtZVN0YXR1cyAhPT0gR0FNRV9TVEFUVVMuV09SSylcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHRoaXMuX2dhbWVTdGF0dXMgPSBHQU1FX1NUQVRVUy5QQVVTRTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgbW92ZUxlZnQoKSB7XHJcbiAgICBpZih0aGlzLl9nYW1lU3RhdHVzICE9PSBHQU1FX1NUQVRVUy5XT1JLKVxyXG4gICAgIHJldHVybjtcclxuXHJcbiAgICBpZighdGhpcy5fY2FuU2hhcGVNb3ZlKDAsIC0xKSlcclxuICAgICAgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3NoYXBlLnBvc2l0aW9uLlgtLTtcclxuICAgIHRoaXMuX3JlbmRlckhhbmRsZSh0aGlzLnN0YXRlKTtcclxuICB9XHJcblxyXG4gIG1vdmVSaWdodCgpIHsgXHJcbiAgICBpZih0aGlzLl9nYW1lU3RhdHVzICE9PSBHQU1FX1NUQVRVUy5XT1JLKVxyXG4gICAgIHJldHVybjtcclxuXHJcbiAgICBpZighdGhpcy5fY2FuU2hhcGVNb3ZlKDAsIDEpKVxyXG4gICAgICByZXR1cm47XHJcblxyXG4gICAgdGhpcy5fc2hhcGUucG9zaXRpb24uWCsrO1xyXG4gICAgdGhpcy5fcmVuZGVySGFuZGxlKHRoaXMuc3RhdGUpO1xyXG4gIH1cclxuXHJcbiAgbW92ZVVwKCkgeyBcclxuICAgIGlmKHRoaXMuX2dhbWVTdGF0dXMgIT09IEdBTUVfU1RBVFVTLldPUkspXHJcbiAgICAgcmV0dXJuO1xyXG4gICAgIFxyXG4gICAgaWYoIXRoaXMuX2NhblNoYXBlTW92ZSgxLCAwKSlcclxuICAgICAgcmV0dXJuO1xyXG4gICAgXHJcbiAgICB0aGlzLl9zaGFwZS5wb3NpdGlvbi5ZKys7XHJcbiAgICB0aGlzLl9yZW5kZXJIYW5kbGUodGhpcy5zdGF0ZSk7XHJcbiAgfVxyXG5cclxuICBtb3ZlRG93bigpIHsgXHJcbiAgICBpZih0aGlzLl9nYW1lU3RhdHVzICE9PSBHQU1FX1NUQVRVUy5XT1JLKVxyXG4gICAgIHJldHVybjtcclxuXHJcbiAgICBpZighdGhpcy5fY2FuU2hhcGVNb3ZlKC0xLCAwKSkge1xyXG4gICAgICBpZighdGhpcy5fYWRkU2hhcGVUb0hlYXAoKSkge1xyXG4gICAgICAgIHRoaXMuX2dhbWVTdGF0dXMgPSBHQU1FX1NUQVRVUy5PVkVSO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlckhhbmRsZSh0aGlzLnN0YXRlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLl9zaGFwZS5wb3NpdGlvbi5ZLS07XHJcbiAgICB0aGlzLl9yZW5kZXJIYW5kbGUodGhpcy5zdGF0ZSk7XHJcbiAgfVxyXG5cclxuICBfYWRkU2hhcGVUb0hlYXAoKSB7XHJcbiAgICBsZXQgbmV3Um93Rm9ySGVhcCA9IFtdO1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMud2lkdGg7IGkrKylcclxuICAgICAgbmV3Um93Rm9ySGVhcC5wdXNoKHtcclxuICAgICAgICB2YWw6IDBcclxuICAgICAgfSk7XHJcblxyXG4gICAgZm9yKGxldCB5ID0gU2hhcGVEaW1lbnNpb24gLSAxOyB5ID49IDA7IHktLSkge1xyXG4gICAgICBsZXQgcm93ID0gdGhpcy5fc2hhcGUuYm9keVt5XTtcclxuICAgICAgZm9yKGxldCB4ID0gMDsgeCA8IFNoYXBlRGltZW5zaW9uOyB4KyspIHsgXHJcbiAgICAgICAgICBsZXQgY2VsbCA9IHJvd1t4XTtcclxuICAgICAgICAgIGlmKGNlbGwpIHtcclxuICAgICAgICAgICAgbGV0IGFyZWFJbmRleFkgPSB0aGlzLl9nZXRBcmVhSW5kZXhZRnJvbVNoYXBlKHkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoYXJlYUluZGV4WSA+PSB0aGlzLmhlaWdodCkge1xyXG4gICAgICAgICAgICAgIC8vZ2FtZSBvdmVyIDopXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB3aGlsZShhcmVhSW5kZXhZID49IHRoaXMuX2hlYXAubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5faGVhcC5wdXNoKG5ld1Jvd0ZvckhlYXAuc2xpY2UoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBhcmVhSW5kZXhYID0gdGhpcy5fZ2V0QXJlYUluZGV4WEZyb21TaGFwZSh4KTtcclxuICAgICAgICAgICAgdGhpcy5faGVhcFthcmVhSW5kZXhZXVthcmVhSW5kZXhYXSA9IHtcclxuICAgICAgICAgICAgICB2YWw6IDEsXHJcbiAgICAgICAgICAgICAgY2xhc3M6IHRoaXMuX3NoYXBlLm5hbWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NoZWNrSGVhcEZvclJlZHVjZSgpO1xyXG5cclxuICAgIHRoaXMuX25ld0ZpZ3VyZSgpO1xyXG4gICAgdGhpcy5fcmVuZGVySGFuZGxlKHRoaXMuc3RhdGUpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgX2NoZWNrSGVhcEZvclJlZHVjZSgpIHtcclxuICAgIGxldCBsaW5lc1RvUmVtb3ZlID0gW107XHJcbiAgICBmb3IobGV0IHkgPSB0aGlzLl9oZWFwLmxlbmd0aCAtIDE7IHkgPj0gMDsgeS0tKSB7XHJcbiAgICAgIGxldCByb3cgPSB0aGlzLl9oZWFwW3ldO1xyXG4gICAgICBsZXQgaXNUaGVyZUVtcHR5U3F1YXJlID0gZmFsc2U7XHJcbiAgICAgIGZvcihsZXQgeCA9IDA7IHggPCByb3cubGVuZ3RoOyB4KyspIHsgXHJcbiAgICAgICAgaWYoIXRoaXMuX2hlYXBbeV1beF0udmFsKSB7XHJcbiAgICAgICAgICBpc1RoZXJlRW1wdHlTcXVhcmUgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZighaXNUaGVyZUVtcHR5U3F1YXJlKVxyXG4gICAgICAgIGxpbmVzVG9SZW1vdmUucHVzaCh5KTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbmV3SGVhcCA9IFtdXHJcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuX2hlYXAubGVuZ3RoOyB5KyspIHtcclxuICAgICAgaWYobGluZXNUb1JlbW92ZS5pbmRleE9mKHkpID09IC0xKVxyXG4gICAgICAgIG5ld0hlYXAucHVzaCh0aGlzLl9oZWFwW3ldKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zdGF0aXN0aWMuY291bnRMaW5lc1JlZHVjZWQgKz0gbGluZXNUb1JlbW92ZS5sZW5ndGg7XHJcbiAgICBzd2l0Y2gobGluZXNUb1JlbW92ZS5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHRoaXMuX3N0YXRpc3RpYy5jb3VudERvdWJsZUxpbmVzUmVkdWNlZCsrO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgdGhpcy5fc3RhdGlzdGljLmNvdW50VHJpcHBsZUxpbmVzUmVkdWNlZCsrO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDQ6IFxyXG4gICAgICAgIHRoaXMuX3N0YXRpc3RpYy5jb3VudFF1YWRydXBsZUxpbmVzUmVkdWNlZCsrO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2hlYXAgPSBuZXdIZWFwO1xyXG4gIH1cclxuXHJcbiAgcm90YXRlKCkgeyBcclxuICAgIGlmKHRoaXMuX2dhbWVTdGF0dXMgIT09IEdBTUVfU1RBVFVTLldPUkspXHJcbiAgICAgcmV0dXJuO1xyXG4gICAgXHJcbiAgICBpZighdGhpcy5fY2FuU2hhcGVNb3ZlKDAsIDAsIHRoaXMuX3NoYXBlLmdldFJvdGF0ZWRCb2R5KCkpKVxyXG4gICAgICByZXR1cm47XHJcbiAgICAgIFxyXG4gICAgdGhpcy5fc2hhcGUucm90YXRlKCk7XHJcbiAgICB0aGlzLl9yZW5kZXJIYW5kbGUodGhpcy5zdGF0ZSk7XHJcbiAgfVxyXG5cclxuICByb3RhdGVCYWNrKCkgeyBcclxuICAgIGlmKHRoaXMuX2dhbWVTdGF0dXMgIT09IEdBTUVfU1RBVFVTLldPUkspXHJcbiAgICAgcmV0dXJuO1xyXG5cclxuICAgIGlmKCF0aGlzLl9jYW5TaGFwZU1vdmUoMCwgMCwgdGhpcy5fc2hhcGUuZ2V0Um90YXRlZEJhY2tCb2R5KCkpKVxyXG4gICAgICByZXR1cm47XHJcbiAgICBcclxuICAgIHRoaXMuX3NoYXBlLnJvdGF0ZUJhY2soKTtcclxuICAgIHRoaXMuX3JlbmRlckhhbmRsZSh0aGlzLnN0YXRlKTtcclxuICB9XHJcblxyXG4gIF9nZXRTaGFwZUluZGV4WCh4KSB7XHJcbiAgICByZXR1cm4geCAtIHRoaXMuX3NoYXBlLnBvc2l0aW9uLlg7XHJcbiAgfVxyXG5cclxuICBfZ2V0U2hhcGVJbmRleFkoeSkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NoYXBlLnBvc2l0aW9uLlkgKyAoU2hhcGVEaW1lbnNpb24gLSAxKSAtIHk7XHJcbiAgfVxyXG5cclxuICBfZ2V0QXJlYUluZGV4WEZyb21TaGFwZShzaGFwZVgsIGRlbHRhID0gMCkge1xyXG4gICAgcmV0dXJuIHNoYXBlWCArIHRoaXMuX3NoYXBlLnBvc2l0aW9uLlggKyBkZWx0YTtcclxuICB9XHJcblxyXG4gIF9nZXRBcmVhSW5kZXhZRnJvbVNoYXBlKHNoYXBlWSwgZGVsdGEgPSAwKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9zaGFwZS5wb3NpdGlvbi5ZICsgKFNoYXBlRGltZW5zaW9uIC0gMSkgLSBzaGFwZVkgKyBkZWx0YTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNwZWNpZmllcyB0aGF0IGNhbiBhIHNoYXBlIG1vdmUuIFxyXG4gICAqIElmIG5ldyBjb29yZGluYXRlcyBvZiBzaGFwZSBvdmVybGFwIHdpdGggY29vcmRpbmF0ZXMgb2YgaGVhcCBcclxuICAgKiBvciBhcmUgb3V0c2lkZSB0aGUgZ2FtZSBhcmVhIHRoZSBzaGFwZSBjYW4ndCBtb3ZlXHJcbiAgICogQHBhcmFtIHsqfSBkZWx0YVkgc3BlY2lmaWVzIHZlcnRpY2FsIG1vdmluZyBkaXN0YW5jZVxyXG4gICAqIEBwYXJhbSB7Kn0gZGVsdGFYIHNwZWNpZmllcyBob3Jpem9udGFsIG1vdmluZyBkaXN0YW5jZVxyXG4gICAqIEBwYXJhbSB7Kn0gc2hhcGVCb2R5IHNwZWNpZmllcyBjaGFuZ2VkIGJvZHkgb2YgYSBzaGFwZSwgZm9yIGV4YW1wbGUgcm90YXRlZCBib2R5XHJcbiAgICovXHJcbiAgX2NhblNoYXBlTW92ZShkZWx0YVksIGRlbHRhWCwgc2hhcGVCb2R5KSB7XHJcbiAgICBpZighc2hhcGVCb2R5KVxyXG4gICAgICBzaGFwZUJvZHkgPSB0aGlzLl9zaGFwZS5ib2R5O1xyXG5cclxuICAgIGZvcihsZXQgeSA9IDA7IHkgPCBzaGFwZUJvZHkubGVuZ3RoOyB5KyspIHtcclxuICAgICAgbGV0IHJvdyA9IHNoYXBlQm9keVt5XTtcclxuICAgICAgbGV0IGFyZWFJbmRleFkgPSB0aGlzLl9nZXRBcmVhSW5kZXhZRnJvbVNoYXBlKHksIGRlbHRhWSk7XHJcbiAgICAgIFxyXG4gICAgICBmb3IobGV0IHggPSAwOyB4IDwgcm93Lmxlbmd0aDsgeCsrKSB7XHJcbiAgICAgICAgbGV0IGNlbGwgPSByb3dbeF07XHJcbiAgICAgICAgaWYoY2VsbCkge1xyXG4gICAgICAgICAgbGV0IGFyZWFJbmRleFggPSB0aGlzLl9nZXRBcmVhSW5kZXhYRnJvbVNoYXBlKHgsIGRlbHRhWCk7XHJcblxyXG4gICAgICAgICAgLy9jaGVjayB3aWxsIHRoZSBzaGFwZSBnbyBvdmVyIHRoZSB3YWxscyBhbmQgdGhlIGdyb3VuZFxyXG4gICAgICAgICAgaWYoYXJlYUluZGV4WSA8IDAgfHwgYXJlYUluZGV4WCA8IDAgfHwgYXJlYUluZGV4WCA+PSB0aGlzLndpZHRoKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgaWYodGhpcy5faXNIZWFwU3F1YXJlKGFyZWFJbmRleFksIGFyZWFJbmRleFggKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgX2lzU2hhcGVTcXVhcmUoeSwgeCkge1xyXG4gICAgICBpZighdGhpcy5fc2hhcGUgfHwgIXRoaXMuX3NoYXBlLmJvZHkpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBsZXQgcm93ID0gdGhpcy5fc2hhcGUuYm9keVt0aGlzLl9nZXRTaGFwZUluZGV4WSh5KV07XHJcbiAgICAgIHJldHVybiByb3cgJiYgcm93W3RoaXMuX2dldFNoYXBlSW5kZXhYKHgpXTtcclxuICB9XHJcblxyXG4gIF9pc0hlYXBTcXVhcmUoeSwgeCkge1xyXG4gICAgaWYoIXRoaXMuX2hlYXApXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5faGVhcFt5XSAmJiB0aGlzLl9oZWFwW3ldW3hdLnZhbDtcclxuICB9XHJcblxyXG4gIF9nZXRIZWFwQ2xhc3MoeSwgeCkge1xyXG4gICAgaWYoIXRoaXMuX2hlYXApXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICBpZighdGhpcy5faGVhcFt5XSB8fCAhdGhpcy5faGVhcFt5XVt4XS52YWwpXHJcbiAgICAgIHJldHVybjtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5faGVhcFt5XVt4XS5jbGFzcztcclxuICB9XHJcblxyXG4gIF9nZXRCb2R5KCkge1xyXG4gICAgbGV0IGJvZHkgPSBbXTtcclxuICAgIGZvciAobGV0IHkgPSB0aGlzLmhlaWdodCAtIDE7IHkgPj0gMDsgeS0tKSB7XHJcbiAgICAgICAgbGV0IHJvdyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICBsZXQgaXNIZWFwID0gdGhpcy5faXNIZWFwU3F1YXJlKHksIHgpO1xyXG4gICAgICAgICAgbGV0IGlzU2hhcGUgPSB0aGlzLl9pc1NoYXBlU3F1YXJlKHksIHgpO1xyXG4gICAgICAgICAgbGV0IHZhbCA9IGlzSGVhcCA/IDIgOiBpc1NoYXBlID8gMSA6IDA7IFxyXG5cclxuICAgICAgICAgIHJvdy5wdXNoKHtcclxuICAgICAgICAgICAgICB2YWw6IHZhbCxcclxuICAgICAgICAgICAgICBjc3NDbGFzc2VzOiBbXHJcbiAgICAgICAgICAgICAgICBpc1NoYXBlID8gJ3NoYXBlJyA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBpc0hlYXAgPyAnaGVhcCcgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgaXNTaGFwZSA/IHRoaXMuX3NoYXBlLm5hbWUgKyAnJyA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBpc0hlYXAgPyB0aGlzLl9nZXRIZWFwQ2xhc3MoeSwgeCkgOiBudWxsXHJcbiAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJvZHkucHVzaChyb3cpO1xyXG5cclxuICAgIH1cclxuICAgIHJldHVybiBib2R5O1xyXG4gIH1cclxuXHJcbiAgZ2V0IHN0YXRlKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZ2FtZVN0YXR1czogdGhpcy5fZ2FtZVN0YXR1cyxcclxuICAgICAgYm9keTogdGhpcy5fZ2V0Qm9keSgpLFxyXG4gICAgICBzaGFwZU5hbWU6IHRoaXMuX3NoYXBlID8gdGhpcy5fc2hhcGUubmFtZSA6IG51bGwsXHJcbiAgICAgIG5leHRTaGFwZToge1xyXG4gICAgICAgIG5hbWU6IHRoaXMuX25leHRTaGFwZSA/IHRoaXMuX25leHRTaGFwZS5uYW1lIDogbnVsbCxcclxuICAgICAgICBib2R5OiB0aGlzLl9uZXh0U2hhcGUgPyB0aGlzLl9uZXh0U2hhcGUuYm9keSA6IG51bGwsXHJcbiAgICAgIH0sICAgICAgXHJcbiAgICAgIHN0YXRpc3RpYzogdGhpcy5fc3RhdGlzdGljXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRW51bSByZXByZXNlbnRzIHN0YXR1cyBvZiBhIGdhbWVcclxuICogXHJcbiAqIElOSVQgLSBnYW1lIHdhcyBub3Qgc3RhcnRlZFxyXG4gKiBXT1JLIC0gZ2FtZSBpcyBydW5uaW5nXHJcbiAqIFBBVVNFIC0gZ2FtZSB3YXMgdGVtcG9yYXJ5IHN0b3BwZWRcclxuICogT1ZFUiAtIGdhbWUgd2FzIGZpbmlzaGVkXHJcbiAqL1xyXG5jb25zdCBHQU1FX1NUQVRVUyA9IHtcclxuICBJTklUOiAwLFxyXG4gIFdPUks6IDEsXHJcbiAgUEFVU0U6IDIsXHJcbiAgT1ZFUjogM1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZ2luZTsiLCJsZXQgRW5naW5lID0gcmVxdWlyZSgnLi9lbmdpbmUnKVxyXG5sZXQgdGV0cmFTaGFwZXMgPSByZXF1aXJlKCcuL3RldHJhLXNoYXBlcycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHsgRW5naW5lLCB0ZXRyYVNoYXBlcyB9OyIsIi8qKlxyXG4gKiBNYXggZGltZW5zaW9uIG9mIGV2ZXJ5IHNoYXBlXHJcbiAqL1xyXG5jb25zdCBTaGFwZURpbWVuc2lvbiA9IDU7XHJcblxyXG4vKipcclxuICogSW1wbGVtZW50cyBhIGZhbGxpbmcgc2hhcGVcclxuICovXHJcbmNsYXNzIFNoYXBlIHtcclxuICAgIGNvbnN0cnVjdG9yKHNoYXBlc1NldCwgWCA9IDUsIFkgPSAxMikge1xyXG4gICAgICAgIGlmKCFzaGFwZXNTZXQpXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1NldCBvZiBzaGFwZXMgd2FzIG5vdCBzZXR0ZWQhJylcclxuXHJcbiAgICAgICAgdGhpcy5fc2hhcGUgPSB0aGlzLl9zZWxlY3ROZXh0U2hhcGUoc2hhcGVzU2V0KTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHtcclxuICAgICAgICAgICBYOiBYLFxyXG4gICAgICAgICAgIFk6IFlcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLl9jYWxjdWxhdGVQcm9wZXJ0aWVzKCk7XHJcbiAgICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiBTZWxlY3RpbmcgbmV4dCBzaGFwZSBmcm9tIHRoZSBhdmFpbGFibGUgc2V0IG9mIHNoYXBlc1xyXG4gICAgICAqIEBwcml2YXRlXHJcbiAgICAgICovXHJcbiAgICAgX3NlbGVjdE5leHRTaGFwZShzaGFwZXNTZXQpIHtcclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgIGxldCBzZWxlY3RlZFNoYXBlO1xyXG4gICAgICAgIGZvciAobGV0IHByb3AgaW4gc2hhcGVzU2V0KSB7XHJcbiAgICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAxIC8gKytjb3VudClcclxuICAgICAgICAgICAgICBzZWxlY3RlZFNoYXBlID0gcHJvcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gc2VsZWN0ZWRTaGFwZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNoYXBlc1NldFtzZWxlY3RlZFNoYXBlXTtcclxuICAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICAqIENhbGN1bGF0aW5nIGFsbCBwcm9wZXJ0aWVzIHRoYXQgY2hhbmdlIHdoZW4gYSBzaGFwZSBpcyByb3RhdGVkXHJcbiAgICAgICogQHByaXZhdGVcclxuICAgICAgKi9cclxuICAgICBfY2FsY3VsYXRlUHJvcGVydGllcygpIHtcclxuICAgICAgICB0aGlzLl9jYWxjdWxhdGVQYWRkaW5ncygpO1xyXG4gICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICogQ2FsY3VsYXRpbmcgcGFkZGluZ3NcclxuICAgICAgKi9cclxuICAgICBfY2FsY3VsYXRlUGFkZGluZ3MoKSB7XHJcbiAgICAgICAgbGV0IHBhZGRpbmdMZWZ0ID0gU2hhcGVEaW1lbnNpb247XHJcbiAgICAgICAgbGV0IHBhZGRpbmdSaWdodCA9IFNoYXBlRGltZW5zaW9uO1xyXG4gICAgICAgIGxldCBwYWRkaW5nVG9wID0gLTE7XHJcbiAgICAgICAgbGV0IHBhZGRpbmdCb3R0b20gPSAtMTtcclxuICBcclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IFNoYXBlRGltZW5zaW9uOyB5KyspIHtcclxuICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgIHggPCBTaGFwZURpbWVuc2lvbjsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX3NoYXBlW3ldW3hdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFkZGluZ0xlZnQgPiB4KVxyXG4gICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSB4O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYWRkaW5nVG9wIDwgMCkgXHJcbiAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3AgPSB5O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgIGZvciAobGV0IHkgPSBTaGFwZURpbWVuc2lvbiAtIDE7IHkgPj0gMDsgeS0tKSB7XHJcbiAgICAgICAgICAgZm9yIChsZXQgeCA9IFNoYXBlRGltZW5zaW9uIC0gMTsgIHggPj0gMDsgeC0tKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX3NoYXBlW3ldW3hdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFkZGluZ1JpZ2h0ID4gU2hhcGVEaW1lbnNpb24gLSAxIC0geClcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQgPSBTaGFwZURpbWVuc2lvbiAtIDEgLSB4O1xyXG4gIFxyXG4gICAgICAgICAgICAgICAgaWYgKHBhZGRpbmdCb3R0b20gPCAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b20gPSBTaGFwZURpbWVuc2lvbiAtIDEgLSB5O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdMZWZ0ID0gcGFkZGluZ0xlZnQ7XHJcbiAgICAgICAgdGhpcy5fcGFkZGluZ1JpZ2h0ID0gcGFkZGluZ1JpZ2h0O1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdUb3AgPSBwYWRkaW5nVG9wO1xyXG4gICAgICAgIHRoaXMuX3BhZGRpbmdCb3R0b20gPSBwYWRkaW5nQm90dG9tO1xyXG4gICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICogcm90YXRpbmcgYSBzaGFwZSBjbG9ja3dpc2VcclxuICAgICAgKiBAcHVibGljXHJcbiAgICAgICovXHJcbiAgICAgcm90YXRlKCkgeyAgXHJcbiAgICAgICAgdGhpcy5fc2hhcGUgPSB0aGlzLmdldFJvdGF0ZWRCb2R5KCk7XHJcbiAgICAgICAgdGhpcy5fY2FsY3VsYXRlUHJvcGVydGllcygpO1xyXG4gICAgIH1cclxuXHJcbiAgICAgZ2V0Um90YXRlZEJvZHkoKSB7XHJcbiAgICAgICAgbGV0IG5ld1NoYXBlID0gW107XHJcbiAgXHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7ICB4IDwgU2hhcGVEaW1lbnNpb247IHgrKykge1xyXG4gICAgICAgICAgIGxldCBuZXdSb3cgPSBbXTtcclxuICAgICAgICAgICBmb3IgKGxldCB5ID0gU2hhcGVEaW1lbnNpb24gLSAxOyB5ID49IDA7IHktLSkge1xyXG4gICAgICAgICAgICAgIG5ld1Jvdy5wdXNoKHRoaXMuX3NoYXBlW3ldW3hdKTtcclxuICAgICAgICAgICB9XHJcbiAgICAgICAgICAgbmV3U2hhcGUucHVzaChuZXdSb3cpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ld1NoYXBlO1xyXG4gICAgIH1cclxuICBcclxuICAgICAvKipcclxuICAgICAgKiByb3RhdGluZyBhIHNoYXBlIGNvdW50ZXJjbG9ja3dpc2VcclxuICAgICAgKiBAcHVibGljXHJcbiAgICAgICovXHJcbiAgICAgcm90YXRlQmFjaygpIHtcclxuICAgICAgICB0aGlzLl9zaGFwZSA9IHRoaXMuZ2V0Um90YXRlZEJhY2tCb2R5KCk7XHJcbiAgICAgICAgdGhpcy5fY2FsY3VsYXRlUHJvcGVydGllcygpO1xyXG4gICAgIH1cclxuXHJcbiAgICAgZ2V0Um90YXRlZEJhY2tCb2R5KCkge1xyXG4gICAgICAgIGxldCBuZXdTaGFwZSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHggPSBTaGFwZURpbWVuc2lvbiAtIDE7ICB4ID49IDA7IHgtLSkge1xyXG4gICAgICAgICAgIGxldCBuZXdSb3cgPSBbXTtcclxuICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IFNoYXBlRGltZW5zaW9uOyB5KyspIHtcclxuICAgICAgICAgICAgICBuZXdSb3cucHVzaCh0aGlzLl9zaGFwZVt5XVt4XSk7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgICAgIG5ld1NoYXBlLnB1c2gobmV3Um93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXdTaGFwZTtcclxuICAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICAqIGdldHRpbmcgYWN0dWFsIHNoYXBlIGJvZHlcclxuICAgICAgKiBAcHVibGljXHJcbiAgICAgICovXHJcbiAgICAgZ2V0IGJvZHkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoYXBlO1xyXG4gICAgIH1cclxuICBcclxuICAgICAvKipcclxuICAgICAgKiBnZXR0aW5nIHRvcCBwYWRkaW5nIGZvciBzaGFwZSByZWxhdGl2ZWx5IHNoYXBlJ3MgYm9yZGVyXHJcbiAgICAgICogQHB1YmxpY1xyXG4gICAgICAqL1xyXG4gICAgIGdldCBwYWRkaW5nVG9wKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYWRkaW5nVG9wO1xyXG4gICAgIH1cclxuICBcclxuICAgIC8qKlxyXG4gICAgICAqIGdldHRpbmcgYm90dG9tIHBhZGRpbmcgZm9yIHNoYXBlIHJlbGF0aXZlbHkgc2hhcGUncyBib3JkZXJcclxuICAgICAgKiBAcHVibGljXHJcbiAgICAgICovXHJcbiAgICAgZ2V0IHBhZGRpbmdCb3R0b20oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZGRpbmdCb3R0b207XHJcbiAgICAgfVxyXG4gIFxyXG4gICAgLyoqXHJcbiAgICAgICogZ2V0dGluZyByaWdodCBwYWRkaW5nIGZvciBzaGFwZSByZWxhdGl2ZWx5IHNoYXBlJ3MgYm9yZGVyXHJcbiAgICAgICogQHB1YmxpY1xyXG4gICAgICAqL1xyXG4gICAgIGdldCBwYWRkaW5nUmlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhZGRpbmdSaWdodDtcclxuICAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogZ2V0dGluZyBsZWZ0IHBhZGRpbmcgZm9yIHNoYXBlIHJlbGF0aXZlbHkgc2hhcGUncyBib3JkZXJcclxuICAgICAgKiBAcHVibGljXHJcbiAgICAgICovXHJcbiAgICAgZ2V0IHBhZGRpbmdMZWZ0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYWRkaW5nTGVmdDtcclxuICAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgU2hhcGUsXHJcbiAgICBTaGFwZURpbWVuc2lvblxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgSVNoYXBlOiBbXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMSwgMSwgMSwgMSwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICBdLFxyXG4gICAgWlNoYXBlOiBbXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMSwgMSwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMSwgMSwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICBdLFxyXG4gICAgU1NoYXBlOiBbXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMSwgMSwgMF0sXHJcbiAgICAgICBbMCwgMSwgMSwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICBdLFxyXG4gICAgTFNoYXBlOiBbXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMSwgMSwgMSwgMF0sXHJcbiAgICAgICBbMCwgMSwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICBdLFxyXG4gICAgSlNoYXBlOiBbXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMSwgMSwgMSwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMSwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICBdLFxyXG4gICAgT1NoYXBlOiBbXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMSwgMSwgMCwgMF0sXHJcbiAgICAgICBbMCwgMSwgMSwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICBdLFxyXG4gICAgVFNoYXBlOiBbXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICBbMCwgMSwgMSwgMSwgMF0sXHJcbiAgICAgICBbMCwgMCwgMSwgMCwgMF0sXHJcbiAgICAgICBbMCwgMCwgMCwgMCwgMF0sXHJcbiAgICBdXHJcbiB9O1xyXG4gIl19
