import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import styles from './range.css.js';

const Slider = (props) => {
  const initialValue = props.value ? props.value : props.multiple ? [...props.settings.start] : props.settings.start;
  const [value, setValue] = useState(initialValue);
  const [position, setPosition] = useState(props.multiple ? [] : 0);
  const [mouseDown, setMouseDown] = useState(false);
  const [innerLeft, setInnerLeft] = useState();
  const [innerRight, setInnerRight] = useState();
  const [dimensions, setDimensions] = useState({
    width: (typeof window === 'undefined') ? null : window.innerWidth,
    height: (typeof window === 'undefined') ? null : window.innerHeight,
  });

  const refInner = useRef();
  const refTrack = useRef();
  const refTrackFill = useRef();

  const numberOfThumbs = useMemo(() => props.multiple ? value.length : 1, [props.multiple, value]);
  const offset = 10;

  const precision = useMemo(() => {
    let split = String(props.settings.step).split(".");
    let decimalPlaces;
    if (split.length === 2) {
      decimalPlaces = split[1].length;
    } else {
      decimalPlaces = 0;
    }
    return Math.pow(10, decimalPlaces);
  }, [props.settings.step]);

  const determineValue = (startPos, endPos, currentPos) => {
    let ratio = (currentPos - startPos) / (endPos - startPos);
    let range = props.settings.max - props.settings.min;
    let difference =
      Math.round((ratio * range) / props.settings.step) *
      props.settings.step;
    // Use precision to avoid ugly Javascript floating point rounding issues
    // (like 35 * .01 = 0.35000000000000003)
    difference = Math.round(difference * precision) / precision;
    return difference + props.settings.min;
  };

  const determineThumb = (positionToCheck) => {
    if (!props.multiple) {
      return 0;
    }
    if (positionToCheck <= position[0]) {
      return 0;
    }
    if (positionToCheck >= position[numberOfThumbs - 1]) {
      return numberOfThumbs - 1;
    }
    let index = 0;

    for (let i = 0; i < numberOfThumbs - 1; i++) {
      if (
        positionToCheck >= position[i] &&
        positionToCheck < position[i + 1]
      ) {
        const distanceToSecond = Math.abs(
          positionToCheck - position[i + 1]
        );
        const distanceToFirst = Math.abs(positionToCheck - position[i]);
        if (distanceToSecond <= distanceToFirst) {
          return i + 1;
        } else {
          return i;
        }
      }
    }
    return index;
  };

  const determinePosition = (inputValue) => {
    const trackLeft = refTrack.current.getBoundingClientRect().left;
    const innerLeft = refInner.current.getBoundingClientRect().left;
    const ratio = (inputValue - props.settings.min) /
      (props.settings.max - props.settings.min);
    const position =
      Math.round(ratio * refInner.current.offsetWidth) +
      trackLeft - innerLeft - offset;
    return position;
  };

  const setSliderValue = (inputValue, triggeredByUser = true, thumbIndex) => {
    const currentValue = props.multiple ? value[thumbIndex] : value;
    if (currentValue !== inputValue) {
      let newValue;
      if (props.multiple) {
        newValue = [...value];
        newValue[thumbIndex] = inputValue;
        setValue(newValue);
      } else {
        newValue = inputValue;
        setValue(newValue);
      }
      if (
        props.settings.onChange &&
        typeof props.settings.onChange === 'function'
      ) {
        props.settings.onChange(newValue, {
          triggeredByUser,
        });
      }
    }
  };

  const setValuesAndPositions = (inputValue, triggeredByUser) => {
    if (props.multiple) {
      const positions = [...position];
      inputValue.forEach((val, i) => {
        setSliderValue(val, triggeredByUser, i);
        positions[i] = determinePosition(val);
      });
      setPosition(positions);
    } else {
      setSliderValue(inputValue, triggeredByUser);
      setPosition(determinePosition(inputValue));
    }
  };

  const rangeMouseUp = () => {
    setMouseDown(false);
  };

  const handleResize = () => {
    if (typeof window === 'undefined') {
      return;
    }
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    const valueToSet = props.value ? props.value : value;
    setValuesAndPositions(valueToSet, false);
    if (typeof window !== 'undefined') {
      window.addEventListener('mouseup', rangeMouseUp);
      window.addEventListener('resize', handleResize, false);
    }
    return () => {
      setInnerLeft(undefined);
      setInnerRight(undefined);
      if (typeof window !== 'undefined') {
        window.removeEventListener('mouseup', rangeMouseUp);
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    const isValueUnset = value === null || value === undefined;
    if (!isValueUnset) {
      setValuesAndPositions(value, true);
    }
  }, [value, dimensions]);

  const setValuePosition = (inputValue, triggeredByUser, thumbIndex) => {
    if (props.multiple) {
      const positions = [...position];
      positions[thumbIndex] = determinePosition(inputValue);
      setSliderValue(inputValue, triggeredByUser, thumbIndex);
      setPosition(positions);
    } else {
      setValue(inputValue, triggeredByUser);
      setPosition(determinePosition(inputValue));
    }
  };

  const setSliderPosition = (inputPosition, thumbIndex) => {
    if (props.multiple) {
      const newPosition = [...position];
      newPosition[thumbIndex] = inputPosition;
      setPosition(newPosition);
    } else {
      setPosition(inputPosition);
    }
  };

  const rangeMouse = (isTouch, eventTouchOrMouse) => {
    let pageX;
    const event = isTouch ? eventTouchOrMouse.touches[0] : eventTouchOrMouse;
    if (event.pageX) {
      pageX = event.pageX;
    } else {
      // console.log("PageX undefined");
    }
    const newValue = determineValue(innerLeft, innerRight, pageX);
    if (pageX >= innerLeft && pageX <= innerRight) {
      if (
        newValue >= props.settings.min &&
        newValue <= props.settings.max
      ) {
        const position = pageX - innerLeft - offset;
        const thumbIndex = props.multiple
          ? determineThumb(position)
          : undefined;
        if (props.discrete) {
          setValuePosition(newValue, false, thumbIndex);
        } else {
          setSliderPosition(position, thumbIndex);
          setSliderValue(newValue, undefined, thumbIndex);
        }
      }
    }
  };

  const rangeMouseDown = (isTouch, event) => {
    event.stopPropagation();
    if (!props.disabled) {
      if (!isTouch) {
        event.preventDefault();
      }

      setMouseDown(true);
      let innerBoundingClientRect = refInner.current.getBoundingClientRect();
      setInnerLeft(innerBoundingClientRect.left);
      setInnerRight(innerBoundingClientRect.left + refInner.current.offsetWidth);
      rangeMouse(isTouch, event);
    }
  };

  const rangeMouseMove = (isTouch, event) => {
    event.stopPropagation();
    if (!isTouch) {
      event.preventDefault();
    }
    if (mouseDown) {
      rangeMouse(isTouch, event);
    }
  };

  return (
    <div>
      <div
        onMouseDown={(event) => rangeMouseDown(false, event)}
        onMouseMove={(event) => rangeMouseMove(false, event)}
        onMouseUp={(event) => rangeMouseUp(false, event)}
        onTouchEnd={(event) => rangeMouseUp(true, event)}
        onTouchMove={(event) => rangeMouseMove(true, event)}
        onTouchStart={(event) => rangeMouseDown(true, event)}
        style={{
          ...styles.range,
          ...(props.disabled ? styles.disabled : {}),
          ...(props.style ? props.style : {}),
        }}
      >
        <div
          className="semantic_ui_range_inner"
          ref={refInner}
          style={{
            ...styles.inner,
            ...(props.style
              ? props.style.inner
                ? props.style.inner
                : {}
              : {}),
          }}
        >
          <div
            ref={refTrack}
            style={{
              ...styles.track,
              ...(props.inverted ? styles.invertedTrack : {}),
              ...(props.style
                ? props.style.track
                  ? props.style.track
                  : {}
                : {}),
            }}
          />
          <div
            ref={refTrackFill}
            style={{
              ...styles.trackFill,
              ...(props.inverted ? styles.invertedTrackFill : {}),
              ...styles[
                props.inverted
                  ? "inverted-" + props.color
                  : props.color
              ],
              ...(props.style
                ? props.style.trackFill
                  ? props.style.trackFill
                  : {}
                : {}),
              ...(props.disabled ? styles.disabledTrackFill : {}),
              ...(props.style
                ? props.style.disabledTrackFill
                  ? props.style.disabledTrackFill
                  : {}
                : {}),
              ...{ width: position + offset + "px" },
              ...(props.multiple && position.length > 0 ? {
                left: position[0],
                width:
                  position[numberOfThumbs - 1] -
                  position[0],
              } : {}),
            }}
          />

          {props.multiple ? (
            position.map((pos, i) => (
              <div
                key={i}
                style={{
                  ...styles.thumb,
                  ...(props.style
                    ? props.style.thumb
                      ? props.style.thumb
                      : {}
                    : {}),
                  ...{ left: pos + "px" },
                }}
              />
            ))
          ) : (
            <div
              style={{
                ...styles.thumb,
                ...(props.style
                  ? props.style.thumb
                    ? props.style.thumb
                    : {}
                  : {}),
                ...{ left: position + "px" },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

Slider.defaultProps = {
  color: "red",
  settings: {
    min: 0,
    max: 10,
    step: 1,
    start: 0,
  },
};

Slider.propTypes = {
  color: PropTypes.string,
  disabled: PropTypes.bool,
  discrete: PropTypes.bool,
  inverted: PropTypes.bool,
  multiple: PropTypes.bool,
  settings: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    start: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    onChange: PropTypes.func,
  }),
  style: PropTypes.object,
  value: PropTypes.number,
};

export default Slider;
