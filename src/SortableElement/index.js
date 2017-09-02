import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {findDOMNode} from 'react-dom';
import invariant from 'invariant';
import {removeItem} from './utils';

import {provideDisplayName, omit} from '../utils';
// Export Higher Order Sortable Element Component
export default function sortableElement(WrappedComponent, config = {withRef: false}) {
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
      this.helperClass = this.context.manager.helperClass;
      this.selectedClass = this.context.manager.selectedClass;
      const {collection, disabled, index} = this.props;

      if (!disabled) {
        this.setDraggable(collection, index);
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.index !== nextProps.index && this.node) {
        this.node.sortableInfo.index = nextProps.index;
      }
      if (this.props.disabled !== nextProps.disabled) {
        const {collection, disabled, index} = nextProps;
        if (disabled) {
          this.removeDraggable(collection);
        } else {
          this.setDraggable(collection, index);
        }
      } else if (this.props.collection !== nextProps.collection || nextProps.item && nextProps.item.selectedItems) {
        this.removeDraggable(this.props.collection);
        this.setDraggable(nextProps.collection, nextProps.index);
      }
    }

    componentWillUnmount() {
      const {collection, disabled} = this.props;
      this.removeSelectedFromDraglayer();
      if (!disabled) this.removeDraggable(collection);
    }

    setDraggable(collection, index) {
      const node = (this.node = findDOMNode(this));

      node.sortableInfo = {
        index,
        collection,
        manager: this.context.manager,
      };

      this.ref = {node};
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
      const manager = this.context.manager;
      const dragLayer = manager.dragLayer;
      const selectedItemsOnDragLayer = dragLayer.selectedItems;
      if (!(e.metaKey || e.ctrlKey)){
        dragLayer.unselectAll();
        dragLayer.removeAllSelectedFromManagers();
      }
      if (!this.state.selected){
        manager.selected.push(this.node.sortableInfo.index);
        selectedItemsOnDragLayer.push(this);
      }else{
        this.removeSelectedFromManager();
        this.removeSelectedFromDraglayer();
      }
      this.setState({
        selected: !this.state.selected,
      });
    }

    unselect(){
      this.setState({
        selected: false,
      });
    }

    removeSelectedFromDraglayer(){
      removeItem(this.context.manager.dragLayer.selectedItems, this);
    }

    removeSelectedFromManager(){
      removeItem(this.context.manager.selected, this.node.sortableInfo);
    }

    render() {
      const ref = config.withRef ? 'wrappedInstance' : null;
      const props = {...omit(this.props, 'collection', 'disabled', 'index')};
      const {selectedItems} = this.props;
      if (selectedItems){
        return (
          <div>
            {selectedItems.map((value, index)=>
              <div
                key={index}
                className={this.helperClass}>
                  <WrappedComponent
                    key={index}
                    {...value}
                    {...props}
                  />
              </div>)}
          </div>
        );
      }
      const component = <WrappedComponent
          ref={ref}
          {...props}
      />;
      if (this.context.manager.isMultiple){
        return <div
          onClick={this.onSelect}
          className={this.state.selected ? this.selectedClass : ''}>
            {component}
        </div>;
      }
      return component;
    }
  };
}
