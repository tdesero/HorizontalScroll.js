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

    this.isSticky = []; //scrolling

    this.scrollY = window.scrollY || window.pageYOffset; //bindings

    this.handleScroll = this.handleScroll.bind(this);
    this.updateSizes = this.updateSizes.bind(this);
    this.requestFrame = this.requestFrame.bind(this);
    this.start();
  }

  _createClass(HorizontalScroll, [{
    key: "start",
    value: function start() {
      //wait to get size to get scrollY correctly. otherwise
      this.updateSizes();
      var throttledUpdate = this.requestFrame(this.updateSizes);
      window.addEventListener('resize', throttledUpdate.bind(this)); //add one single scroll EventListener

      var throttledHandleScroll = this.requestFrame(this.handleScroll);
      document.addEventListener('scroll', throttledHandleScroll.bind(this), {
        passive: true
      });
    }
  }, {
    key: "updateSizes",
    value: function updateSizes() {
      this.setSizes();
      this.windowHeight = window.innerHeight || document.documentElement.clientHeight;
      this.windowWidth = window.innerWidth || document.documentElement.clientWidth;
    }
  }, {
    key: "setSizes",
    value: function setSizes() {
      //loop through all HorizontalScroll setups
      for (var i = 0; i < this.wrappers.length; i++) {
        //get items inside wrapper
        this.items[i] = this.wrappers[i].querySelectorAll(this.options.item); //wrapperWidth start value will change

        this.wrapperWidths[i] = 0; //setting the wrapper width to include all items
        //atm it probably need some normalize.css to erase all margins etc...

        for (var j = 0; j < this.items[i].length; j++) {
          this.wrapperWidths[i] += this.items[i][j].offsetWidth;
        }

        this.outerHeights[i] = (this.wrapperWidths[i] - this.windowWidth) / this.options.speed + this.windowHeight;
        this.wrappers[i].style.width = this.wrapperWidths[i] + 'px';
        this.outerContainers[i].style.height = this.outerHeights[i] + 'px';
        this.outerContainers[i].style.position = 'relative'; //position has to be set relative

        this.offsets[i] = this.getOffsetTop(this.outerContainers[i]); //attach sticky

        if (this.offsets[i] + this.outerHeights[i] - this.windowHeight < (window.scrollY || window.pageYOffset)) {
          this.dropStickyBottom(i);
        } else {
          this.dropStickyTop(i);
        }
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
    key: "handleScroll",
    value: function handleScroll() {
      this.scrollY = window.scrollY || window.pageYOffset;

      for (var i = 0; i < this.wrappers.length; i++) {
        var top = this.offsets[i] - this.scrollY;
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
        }
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

      this.isSticky[i] = false;
    }
  }, {
    key: "dropStickyBottom",
    value: function dropStickyBottom(i) {
      this.innerContainers[i].style.position = 'absolute';
      this.innerContainers[i].style.top = ''; // erase value

      this.innerContainers[i].style.bottom = '0';
      this.innerContainers[i].style.width = '100%'; // erase value

      this.isSticky[i] = false;
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