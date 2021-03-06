"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HorizontalScroll =
/*#__PURE__*/
function () {
  // constructor
  function HorizontalScroll() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, HorizontalScroll);

    //input options
    this.defaults = {
      outerContainer: '.horizontal-scroll-height-container',
      innerContainer: '.horizontal-scroll-container',
      wrapper: '.horizontal-scroll-wrapper',
      item: '.horizontal-item',
      speed: 1,
      moveInOut: true // boolean

    };
    this.options = _extends({}, this.defaults, options); //DOM elements

    this.outerContainers = this.getElements(this.options.outerContainer);
    this.innerContainers = this.getElements(this.options.innerContainer);
    this.wrappers = this.getElements(this.options.wrapper);
    this.items = []; // will be DOM elements ...
    //sizes

    this.wrapperWidths = [];
    this.outerHeights = [];
    this.offsets = [];
    this.windowHeight = window.innerHeight || document.documentElement.clientHeight;
    this.windowWidth = window.innerWidth || document.documentElement.clientWidth; //sticky

    this.isSticky = []; //bindings

    this.handleScroll = this.handleScroll.bind(this);
    this.updateSizes = this.updateSizes.bind(this);
    this.requestFrame = this.requestFrame.bind(this);
    this.start();
  }

  _createClass(HorizontalScroll, [{
    key: "start",
    value: function start() {
      //had to wrap scrollY in a function because otherwise scrollY would be 0
      //if the document is at about 11000+ pixels scrollY at window load.
      //seems that it hasn't the right value at this point.
      //but later when used in the loop it is right. super strange.
      var scrollY = function scrollY() {
        return window.scrollY || window.pageYOffset;
      };

      this.updateSizes();
      var throttledUpdate = this.requestFrame(this.updateSizes);
      window.addEventListener('resize', throttledUpdate); //attach sticky elements at top or bottom
      //TODO: check if this loop really is needed here or if this could be done somewhere else...

      for (var i = 0; i < this.wrappers.length; i++) {
        if (this.offsets[i] + this.outerHeights[i] - this.windowHeight < scrollY()) {
          this.dropStickyBottom(i);
        } else {
          this.dropStickyTop(i);
        }
      }
    }
  }, {
    key: "setSizes",
    value: function setSizes() {
      var _this = this;

      var _loop = function _loop(i) {
        //get items inside wrapper
        _this.items[i] = _this.wrappers[i].querySelectorAll(_this.options.item); //wrapperWidth start value will change

        _this.wrapperWidths[i] = 0;
        _this.isSticky[i] = false; //setting the wrapper width to include all items
        //atm it probably need some normalize.css to erase all margins etc...

        for (var j = 0; j < _this.items[i].length; j++) {
          _this.wrapperWidths[i] += _this.items[i][j].offsetWidth;
        }

        _this.outerHeights[i] = (_this.wrapperWidths[i] - _this.windowWidth) / _this.options.speed + _this.windowHeight;
        _this.wrappers[i].style.width = _this.wrapperWidths[i] + 'px';
        _this.outerContainers[i].style.height = _this.outerHeights[i] + 'px';
        _this.outerContainers[i].style.position = 'relative'; //position has to be set relative
        //EventListener for each setup

        var throttledScrollHandler = _this.requestFrame(_this.handleScroll);

        document.addEventListener('scroll', function () {
          return throttledScrollHandler(i);
        }, {
          passive: true
        });
      };

      //loop through all HorizontalScroll setups
      for (var i = 0; i < this.wrappers.length; i++) {
        _loop(i);
      }
    }
  }, {
    key: "getOffsetTop",
    value: function getOffsetTop(element) {
      var top = 0;

      do {
        top += element.offsetTop || 0;
        element = element.offsetParent;
      } while (element);

      return top;
    }
  }, {
    key: "getContainerOffsets",
    value: function getContainerOffsets() {
      for (var i = 0; i < this.outerContainers.length; i++) {
        this.offsets[i] = this.getOffsetTop(this.outerContainers[i]);
      }
    }
  }, {
    key: "updateSizes",
    value: function updateSizes() {
      this.setSizes();
      this.getContainerOffsets();
      this.windowHeight = window.innerHeight || document.documentElement.clientHeight;
      this.windowWidth = window.innerWidth || document.documentElement.clientWidth;
    }
  }, {
    key: "handleScroll",
    value: function handleScroll(i) {
      var scrollY = window.scrollY || window.pageYOffset;
      var top = this.offsets[i] - scrollY;
      var shouldStick = top < 0 && -1 * top < this.outerHeights[i] - this.windowHeight; //transform value either not limited or with limits. see this.options.moveInOut

      var transform = this.options.moveInOut ? top * this.options.speed : Math.min(Math.max(parseInt(top * this.options.speed), (this.wrapperWidths[i] - this.windowWidth) * -1), 0);

      if (top < this.windowHeight && -1 * top < this.outerHeights[i]) {
        this.wrappers[i].style.transform = 'translate3D(' + transform + 'px, 0, 0)';
      }

      if (!this.isSticky[i] && shouldStick) {
        this.makeSticky(i);
        this.isSticky[i] = true;
      } else if (this.isSticky[i] && !shouldStick) {
        if (top < 0) {
          this.dropStickyBottom(i);
        } else {
          this.dropStickyTop(i);
        }

        this.isSticky[i] = false;
      }
    }
  }, {
    key: "makeSticky",
    value: function makeSticky(i) {
      this.innerContainers[i].style.position = 'fixed';
      this.innerContainers[i].style.top = 0;
      this.innerContainers[i].style.bottom = ''; // erase value

      this.innerContainers[i].style.width = '100%';
    }
  }, {
    key: "dropStickyTop",
    value: function dropStickyTop(i) {
      this.innerContainers[i].style.position = ''; // erase value

      this.innerContainers[i].style.top = ''; // erase value

      this.innerContainers[i].style.bottom = ''; // erase value

      this.innerContainers[i].style.width = ''; // erase value
    }
  }, {
    key: "dropStickyBottom",
    value: function dropStickyBottom(i) {
      this.innerContainers[i].style.position = 'absolute';
      this.innerContainers[i].style.top = ''; // erase value

      this.innerContainers[i].style.bottom = '0';
      this.innerContainers[i].style.width = '100%'; // erase value
    } //helper

  }, {
    key: "getElements",
    value: function getElements(string) {
      return document.querySelectorAll(string);
    } //utility requestanimationframe throttle function

  }, {
    key: "requestFrame",
    value: function requestFrame(callback) {
      var wait = false;
      var args;
      return function () {
        if (!wait) {
          wait = true;
          args = arguments;
          requestAnimationFrame(function () {
            callback.apply(null, args);
            wait = false;
          });
        }
      };
    }
  }]);

  return HorizontalScroll;
}();