'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _rangeCss = require('./range.css.js');

var _rangeCss2 = _interopRequireDefault(_rangeCss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Slider = function Slider(props) {
  var initialValue = props.value ? props.value : props.multiple ? [].concat(_toConsumableArray(props.settings.start)) : props.settings.start;

  var _useState = (0, _react.useState)(initialValue),
      _useState2 = _slicedToArray(_useState, 2),
      value = _useState2[0],
      setValue = _useState2[1];

  var _useState3 = (0, _react.useState)(props.multiple ? [] : 0),
      _useState4 = _slicedToArray(_useState3, 2),
      position = _useState4[0],
      setPosition = _useState4[1];

  var _useState5 = (0, _react.useState)(false),
      _useState6 = _slicedToArray(_useState5, 2),
      mouseDown = _useState6[0],
      setMouseDown = _useState6[1];

  var _useState7 = (0, _react.useState)(),
      _useState8 = _slicedToArray(_useState7, 2),
      innerLeft = _useState8[0],
      setInnerLeft = _useState8[1];

  var _useState9 = (0, _react.useState)(),
      _useState10 = _slicedToArray(_useState9, 2),
      innerRight = _useState10[0],
      setInnerRight = _useState10[1];

  var _useState11 = (0, _react.useState)({
    width: typeof window === 'undefined' ? null : window.innerWidth,
    height: typeof window === 'undefined' ? null : window.innerHeight
  }),
      _useState12 = _slicedToArray(_useState11, 2),
      dimensions = _useState12[0],
      setDimensions = _useState12[1];

  var refInner = (0, _react.useRef)();
  var refTrack = (0, _react.useRef)();
  var refTrackFill = (0, _react.useRef)();

  var numberOfThumbs = (0, _react.useMemo)(function () {
    return props.multiple ? value.length : 1;
  }, [props.multiple, value]);
  var offset = 10;

  var precision = (0, _react.useMemo)(function () {
    var split = String(props.settings.step).split(".");
    var decimalPlaces = void 0;
    if (split.length === 2) {
      decimalPlaces = split[1].length;
    } else {
      decimalPlaces = 0;
    }
    return Math.pow(10, decimalPlaces);
  }, [props.settings.step]);

  var determineValue = function determineValue(startPos, endPos, currentPos) {
    var ratio = (currentPos - startPos) / (endPos - startPos);
    var range = props.settings.max - props.settings.min;
    var difference = Math.round(ratio * range / props.settings.step) * props.settings.step;
    // Use precision to avoid ugly Javascript floating point rounding issues
    // (like 35 * .01 = 0.35000000000000003)
    difference = Math.round(difference * precision) / precision;
    return difference + props.settings.min;
  };

  var determineThumb = function determineThumb(positionToCheck) {
    if (!props.multiple) {
      return 0;
    }
    if (positionToCheck <= position[0]) {
      return 0;
    }
    if (positionToCheck >= position[numberOfThumbs - 1]) {
      return numberOfThumbs - 1;
    }
    var index = 0;

    for (var i = 0; i < numberOfThumbs - 1; i++) {
      if (positionToCheck >= position[i] && positionToCheck < position[i + 1]) {
        var distanceToSecond = Math.abs(positionToCheck - position[i + 1]);
        var distanceToFirst = Math.abs(positionToCheck - position[i]);
        if (distanceToSecond <= distanceToFirst) {
          return i + 1;
        } else {
          return i;
        }
      }
    }
    return index;
  };

  var determinePosition = function determinePosition(inputValue) {
    var trackLeft = refTrack.current.getBoundingClientRect().left;
    var innerLeft = refInner.current.getBoundingClientRect().left;
    var ratio = (inputValue - props.settings.min) / (props.settings.max - props.settings.min);
    var position = Math.round(ratio * refInner.current.offsetWidth) + trackLeft - innerLeft - offset;
    return position;
  };

  var setSliderValue = function setSliderValue(inputValue) {
    var triggeredByUser = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var thumbIndex = arguments[2];

    var currentValue = props.multiple ? value[thumbIndex] : value;
    if (currentValue !== inputValue) {
      var newValue = void 0;
      if (props.multiple) {
        newValue = [].concat(_toConsumableArray(value));
        newValue[thumbIndex] = inputValue;
        setValue(newValue);
      } else {
        newValue = inputValue;
        setValue(newValue);
      }
      if (props.settings.onChange && typeof props.settings.onChange === 'function') {
        props.settings.onChange(newValue, {
          triggeredByUser: triggeredByUser
        });
      }
    }
  };

  var setValuesAndPositions = function setValuesAndPositions(inputValue, triggeredByUser) {
    if (props.multiple) {
      var positions = [].concat(_toConsumableArray(position));
      inputValue.forEach(function (val, i) {
        setSliderValue(val, triggeredByUser, i);
        positions[i] = determinePosition(val);
      });
      setPosition(positions);
    } else {
      setSliderValue(inputValue, triggeredByUser);
      setPosition(determinePosition(inputValue));
    }
  };

  var rangeMouseUp = function rangeMouseUp() {
    setMouseDown(false);
  };

  var handleResize = function handleResize() {
    if (typeof window === 'undefined') {
      return;
    }
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  (0, _react.useEffect)(function () {
    var valueToSet = props.value ? props.value : value;
    setValuesAndPositions(valueToSet, false);
    if (typeof window !== 'undefined') {
      window.addEventListener('mouseup', rangeMouseUp);
      window.addEventListener('resize', handleResize, false);
    }
    return function () {
      setInnerLeft(undefined);
      setInnerRight(undefined);
      if (typeof window !== 'undefined') {
        window.removeEventListener('mouseup', rangeMouseUp);
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  (0, _react.useEffect)(function () {
    var isValueUnset = value === null || value === undefined;
    if (!isValueUnset) {
      setValuesAndPositions(value, true);
    }
  }, [value, dimensions]);

  var setValuePosition = function setValuePosition(inputValue, triggeredByUser, thumbIndex) {
    if (props.multiple) {
      var positions = [].concat(_toConsumableArray(position));
      positions[thumbIndex] = determinePosition(inputValue);
      setSliderValue(inputValue, triggeredByUser, thumbIndex);
      setPosition(positions);
    } else {
      setSliderValue(inputValue, triggeredByUser);
      setPosition(determinePosition(inputValue));
    }
  };

  var setSliderPosition = function setSliderPosition(inputPosition, thumbIndex) {
    if (props.multiple) {
      var newPosition = [].concat(_toConsumableArray(position));
      newPosition[thumbIndex] = inputPosition;
      setPosition(newPosition);
    } else {
      setPosition(inputPosition);
    }
  };

  var rangeMouse = function rangeMouse(isTouch, eventTouchOrMouse) {
    var pageX = void 0;
    var event = isTouch ? eventTouchOrMouse.touches[0] : eventTouchOrMouse;
    if (event.pageX) {
      pageX = event.pageX;
    } else {
      // console.log("PageX undefined");
    }
    var newValue = determineValue(innerLeft, innerRight, pageX);
    if (pageX >= innerLeft && pageX <= innerRight) {
      if (newValue >= props.settings.min && newValue <= props.settings.max) {
        var _position = pageX - innerLeft - offset;
        var thumbIndex = props.multiple ? determineThumb(_position) : undefined;
        if (props.discrete) {
          setValuePosition(newValue, false, thumbIndex);
        } else {
          setSliderPosition(_position, thumbIndex);
          setSliderValue(newValue, undefined, thumbIndex);
        }
      }
    }
  };

  var rangeMouseDown = function rangeMouseDown(isTouch, event) {
    event.stopPropagation();
    if (!props.disabled) {
      if (!isTouch) {
        event.preventDefault();
      }

      setMouseDown(true);
      var innerBoundingClientRect = refInner.current.getBoundingClientRect();
      setInnerLeft(innerBoundingClientRect.left);
      setInnerRight(innerBoundingClientRect.left + refInner.current.offsetWidth);
      rangeMouse(isTouch, event);
    }
  };

  var rangeMouseMove = function rangeMouseMove(isTouch, event) {
    event.stopPropagation();
    if (!isTouch) {
      event.preventDefault();
    }
    if (mouseDown) {
      rangeMouse(isTouch, event);
    }
  };

  return _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(
      'div',
      {
        onMouseDown: function onMouseDown(event) {
          return rangeMouseDown(false, event);
        },
        onMouseMove: function onMouseMove(event) {
          return rangeMouseMove(false, event);
        },
        onMouseUp: function onMouseUp(event) {
          return rangeMouseUp(false, event);
        },
        onTouchEnd: function onTouchEnd(event) {
          return rangeMouseUp(true, event);
        },
        onTouchMove: function onTouchMove(event) {
          return rangeMouseMove(true, event);
        },
        onTouchStart: function onTouchStart(event) {
          return rangeMouseDown(true, event);
        },
        style: _extends({}, _rangeCss2.default.range, props.disabled ? _rangeCss2.default.disabled : {}, props.style ? props.style : {})
      },
      _react2.default.createElement(
        'div',
        {
          className: 'semantic_ui_range_inner',
          ref: refInner,
          style: _extends({}, _rangeCss2.default.inner, props.style ? props.style.inner ? props.style.inner : {} : {})
        },
        _react2.default.createElement('div', {
          ref: refTrack,
          style: _extends({}, _rangeCss2.default.track, props.inverted ? _rangeCss2.default.invertedTrack : {}, props.style ? props.style.track ? props.style.track : {} : {})
        }),
        _react2.default.createElement('div', {
          ref: refTrackFill,
          style: _extends({}, _rangeCss2.default.trackFill, props.inverted ? _rangeCss2.default.invertedTrackFill : {}, _rangeCss2.default[props.inverted ? "inverted-" + props.color : props.color], props.style ? props.style.trackFill ? props.style.trackFill : {} : {}, props.disabled ? _rangeCss2.default.disabledTrackFill : {}, props.style ? props.style.disabledTrackFill ? props.style.disabledTrackFill : {} : {}, { width: position + offset + "px" }, props.multiple && position.length > 0 ? {
            left: position[0],
            width: position[numberOfThumbs - 1] - position[0]
          } : {})
        }),
        props.multiple ? position.map(function (pos, i) {
          return _react2.default.createElement('div', {
            key: i,
            style: _extends({}, _rangeCss2.default.thumb, props.style ? props.style.thumb ? props.style.thumb : {} : {}, { left: pos + "px" })
          });
        }) : _react2.default.createElement('div', {
          style: _extends({}, _rangeCss2.default.thumb, props.style ? props.style.thumb ? props.style.thumb : {} : {}, { left: position + "px" })
        })
      )
    )
  );
};

Slider.defaultProps = {
  color: "red",
  settings: {
    min: 0,
    max: 10,
    step: 1,
    start: 0
  }
};

Slider.propTypes = {
  color: _propTypes2.default.string,
  disabled: _propTypes2.default.bool,
  discrete: _propTypes2.default.bool,
  inverted: _propTypes2.default.bool,
  multiple: _propTypes2.default.bool,
  settings: _propTypes2.default.shape({
    min: _propTypes2.default.number,
    max: _propTypes2.default.number,
    step: _propTypes2.default.number,
    start: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number)]),
    onChange: _propTypes2.default.func
  }),
  style: _propTypes2.default.object,
  value: _propTypes2.default.number
};

exports.default = Slider;