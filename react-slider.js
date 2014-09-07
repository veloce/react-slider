(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('react'));
  } else {
    root.ReactSlider = factory(root.React);
  }
}(this, function(React) {
  
  function positiveNumber(props, propName, componentName, location) {
    var value = props[propName];
    if (typeof value !== 'number' || value <= 0) {
      return new Error('Invalid prop `' + propName + '` supplied to `' + componentName +
                       '`, expected number greater than zero');
    }
  }

  var ReactSlider = React.createClass({ displayName: 'ReactSlider',
    
    propTypes: {
      min: React.PropTypes.number,
      max: React.PropTypes.number,
      step: positiveNumber,
      orientation: React.PropTypes.oneOf(['horizontal', 'vertical']),
      onChange: React.PropTypes.func,
      valuePropName: React.PropTypes.string
    },

    getDefaultProps: function() {
      return {
        min: 0,
        max: 100,
        step: 1,
        orientation: 'horizontal',
        valuePropName: 'sliderValue'
      };
    },

    getInitialState: function() {
      return {
        offset: 0,
        lowerBound: 0,
        upperBound: 0,
        handleWidth: 0,
        sliderMin: 0,
        sliderMax: 0,
        value: this.props.min
      };
    },

    componentDidMount: function() {
      var slider = this.refs.slider.getDOMNode();
      var handle = this.refs.handle.getDOMNode();
      var rect = slider.getBoundingClientRect();

      var size = {
        horizontal: 'clientWidth',
        vertical: 'clientHeight'
      }[this.props.orientation];

      var position = {
        horizontal: { min: 'left', max: 'right' },
        vertical: { min: 'top', max: 'bottom' }
      }[this.props.orientation];
      
      this.setState({
        upperBound: slider[size] - handle[size],
        handleWidth: handle[size],
        sliderMin: rect[position.min],
        sliderMax: rect[position.max] - handle[size],
      });
    },

    render: function() {
      var handleStyle = {
        transform: 'translate' + this._axis() + '(' + this.state.offset + 'px)',
        // let this element be the same size as its children.
        display: 'inline-block'
      };

      var userHandle = this.props.children;
      userHandle.props[this.props.valuePropName] = this.state.value;

      return (
        React.DOM.div({ ref: 'slider', className: this.props.className, onClick: this._onClick },
          React.DOM.div({ ref: 'handle', style: handleStyle, onMouseDown: this._dragStart, onTouchMove: this._touchMove }, 
            userHandle
      )));
    },

    _onClick: function(e) {
      var position = e['page' + this._axis()];
      // make center of handle appear under the cursor position
      this._moveHandle(position - (this.state.handleWidth / 2));
    },

    _dragStart: function() {
      document.addEventListener('mousemove', this._dragMove, false);
      document.addEventListener('mouseup', this._dragEnd, false);
    },

    _dragMove: function(e) {
      var position = e['page' + this._axis()];
      this._moveHandle(position);
    },

    _dragEnd: function() {
      document.removeEventListener('mousemove', this._dragMove, false);
      document.removeEventListener('mouseup', this._dragEnd, false);
    },

    _touchMove: function(e) {
      var last = e.changedTouches[e.changedTouches.length - 1];
      var position = last['page' + this._axis()];
      this._moveHandle(position);
      e.preventDefault();
    },

    _moveHandle: function(position) {
      var lastValue = this.state.value;

      var ratio = (position - this.state.sliderMin) / (this.state.sliderMax - this.state.sliderMin);
      var value = ratio * (this.props.max - this.props.min) + this.props.min;

      var nextValue = this._trimAlignValue(value);
      var nextRatio = (nextValue - this.props.min) / (this.props.max - this.props.min);
      var nextOffset = nextRatio * this.state.upperBound;

      this.setState({
        value: nextValue,
        offset: nextOffset
      });

      var changed = nextValue !== lastValue;
      if (changed && this.props.onChange) {
        this.props.onChange(nextValue);
      }
    },

    _axis: function() {
      return {
        'horizontal': 'X',
        'vertical': 'Y'
      }[this.props.orientation];
    },

    _trimAlignValue: function(val) {
      if (val <= this.props.min) val = this.props.min;
      if (val >= this.props.max) val = this.props.max;

      var valModStep = (val - this.props.min) % this.props.step;
      var alignValue = val - valModStep;

      if (Math.abs(valModStep) * 2 >= this.props.step) {
        alignValue += (valModStep > 0) ? this.props.step : (- this.props.step);
      }

      return parseFloat(alignValue.toFixed(5));
    }

  });

  return ReactSlider;

}));
