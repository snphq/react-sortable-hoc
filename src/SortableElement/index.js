import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import invariant from 'invariant';
import { removeItem } from './utils';

import { provideDisplayName, omit } from '../utils';
// Export Higher Order Sortable Element Component
export default function sortableElement(WrappedComponent, config = { withRef: false }) {
  return class extends Component {
    state = {
      selected: false,
    }
    static displayName = provideDisplayName('sortableElement', WrappedComponent);

    static contextTypes = {
      manager: PropTypes.object.isRequired,
    };

    static propTypes = {
      index: PropTypes.number.isRequired,
      collection: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      disabled: PropTypes.bool,
    };

    static defaultProps = {
      collection: 0,
    };

    componentDidMount() {
      const { collection, disabled, index, isAlwaysSelected } = this.props;
      if (isAlwaysSelected) {
        this.context.manager.alwaysSelected.push(index);
      }
      if (!disabled) {
        this.setDraggable(collection, index);
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.index !== nextProps.index && this.node) {
        this.node.sortableInfo.index = nextProps.index;
      }
      if (this.props.disabled !== nextProps.disabled) {
        const { collection, disabled, index } = nextProps;
        if (disabled) {
          this.removeDraggable(collection);
        } else {
          this.setDraggable(collection, index);
        }
      } else if (this.props.collection !== nextProps.collection || nextProps.item && nextProps.item.selectedItems) {
        this.removeDraggable(this.props.collection);
        this.setDraggable(nextProps.collection, nextProps.index);
      }
      this.setState({
        selected: nextProps.isAlwaysSelected,
      });
      if (this.props.isAlwaysSelected !== nextProps.isAlwaysSelected) {
        const { isAlwaysSelected, index } = nextProps;
        const { alwaysSelected } = this.context.manager;
        if (isAlwaysSelected) {
          alwaysSelected.push(index);
        } else {
          removeItem(alwaysSelected, index);
        }
      }
      this.node.sortableInfo.isDisabled = nextProps.disabled;
    }

    componentWillUnmount() {
      const { collection, disabled, isAlwaysSelected, index } = this.props;
      if (isAlwaysSelected) {
        removeItem(this.context.manager.alwaysSelected, index);
      }
      this.removeSelectedFromDraglayer();
      if (!disabled) this.removeDraggable(collection);
    }

    setDraggable(collection, index) {
      const node = (this.node = findDOMNode(this));

      node.sortableInfo = {
        index,
        collection,
        manager: this.context.manager,
        isDisabled: this.props.disabled,
      };

      this.ref = { node };
      this.context.manager.add(collection, this.ref);
    }

    removeDraggable(collection) {
      this.context.manager.remove(collection, this.ref);
    }

    getWrappedInstance() {
      invariant(
        config.withRef,
        'To access the wrapped instance, you need to pass in {withRef: true} as the second argument of the SortableElement() call'
      );
      return this.refs.wrappedInstance;
    }

    onSelect = (e) => {
      if (this.props.isDisabled){
        return;
      }
      const manager = this.context.manager;
      const dragLayer = manager.dragLayer;
      const selectedItemsOnDragLayer = dragLayer.selectedItems;
      if (!(e.metaKey || e.ctrlKey)) {
        dragLayer.unselectAll();
        dragLayer.removeAllSelectedFromManagers();
      }
      if (this.props.isAlwaysSelected) {
        return;
      }
      if (!this.state.selected) {
        manager.selected.push(this.node.sortableInfo.index);
        selectedItemsOnDragLayer.push(this);
      } else {
        this.removeSelectedFromManager();
        this.removeSelectedFromDraglayer();
      }
      this.setState({
        selected: !this.state.selected,
      });
    }

    unselect() {
      this.setState({
        selected: false,
      });
    }

    removeSelectedFromDraglayer() {
      removeItem(this.context.manager.dragLayer.selectedItems, this);
    }

    removeSelectedFromManager() {
      removeItem(this.context.manager.selected, this.node.sortableInfo);
    }

    render() {
      const { helperClass, selectedClass, isMultiple } = this.context.manager;
      const ref = config.withRef ? 'wrappedInstance' : null;
      const props = { ...omit(this.props, 'collection', 'disabled', 'index') };
      const { selectedItems, disabled } = this.props;
      if (selectedItems) {
        return (
          <div>
            {selectedItems.map((value, index) =>
              <div
                key={index}
                className={helperClass}
              >
                <WrappedComponent
                  key={index}
                  {...value}
                  {...props}
                />
              </div>
            )}
          </div>
        );
      }
      const component = (
        <WrappedComponent
          ref={ref}
          {...props}
        />
      );
      if (isMultiple) {
        return (
          <div
            onClick={this.onSelect}
            className={this.state.selected ? selectedClass : ''}
          >
            {component}
          </div>
        );
      }
      return component;
    }
  };
}
