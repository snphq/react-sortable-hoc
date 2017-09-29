import React, { Component } from 'react';
import { SortableContainer, SortableElement, arrayMove, DragLayer } from '../index';
import style from './NestedListsWithMultipleDrag.scss';

const dragLayer = new DragLayer();

const SortableItem = SortableElement(props =>
  <div onClick={props.onChangeActiveItem.bind(this, props.value)}>
    <span style={{ display: 'inline-block', width: '50px' }}>{props.ind}</span>
    {props.value}
  </div>
);

const SortableListItems = SortableContainer(({ items, activeItem, onChangeActiveItem, isDisabled }) =>
  <div>
    {items.map((value, index) => (
      <SortableItem
        key={index}
        index={index}
        isAlwaysSelected={value.value === activeItem}
        onChangeActiveItem={onChangeActiveItem}
        disabled={isDisabled}
        {...value}
      />
    ))}
  </div>
);

const SortablePart = SortableElement(props =>
  <div>
    <div><span style={{ marginLeft: '50px' }}>{props.item.name}</span></div>
    <SortableListItems
      {...props}
      items={props.item.items}
      dragLayer={dragLayer}
      distance={3}
      helperClass={style.dragged}
      selectedClass={style.selected}
      isMultiple={true}
      helperCollision={{ top: 0, bottom: 0 }}
    />
  </div>
);

const SortableListParts = SortableContainer(({ items, onSortItemsEnd, activeItem, onChangeActiveItem, isDisabled }) =>
  <div style={{ height: '300px', overflow: 'auto', userSelect: 'none' }}>
    {items.map((value, index) => (
      <SortablePart
        key={index}
        index={index}
        item={value}
        id={index}
        onMultipleSortEnd={onSortItemsEnd}
        activeItem={activeItem}
        onChangeActiveItem={onChangeActiveItem}
        isDisabled={isDisabled}
        disabled={isDisabled}
      />
    ))}
  </div>
);

const getParts = (countParts, countLessons) => {
  const parts = [];
  for (let i = 0; i < countParts; i++) {
    const lessons = [];
    for (let j = 0; j < countLessons; j++) {
      lessons.push('Lesson-' + (i + 1) + '-' + (j + 1));
    }
    parts.push({
      name: 'Part',
      items: lessons,
    });
  }
  return parts;
};

export default class SortableComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parts: getParts(20, 5),
      activeItem: 'Lesson-1-2',
      isDisabled: false,
    };
  }
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      parts: arrayMove(this.state.parts, oldIndex, newIndex),
    });
  }
  onSortItemsEnd = ({ newListIndex, newIndex, items }) => {
    const parts = this.state.parts.slice();
    const itemsValue = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      itemsValue[i] = item.item.value;
      parts[item.listId].items.splice(item.index, 1);
    }
    parts[newListIndex].items.splice(newIndex, 0, ...itemsValue);
    this.setState({ parts });
  }
  onChangeActiveItem = (value, e) => {
    if (e.metaKey || e.ctrlKey) {
      return;
    }
    this.setState({
      activeItem: value,
    });
  }
  onChangeDisable = () => {
    this.setState({
      isDisabled: !this.state.isDisabled,
    });
  }
  render() {
    const { isDisabled, activeItem } = this.state;
    const parts = this.state.parts.map((value, index) => {
      return {
        name: value.name,
        items: value.items.map((value, ind) => {
          return {
            value,
            ind: (index + 1) + '.' + (ind + 1),
          };
        }),
      };
    });
    return <div>
      <input
        type="checkbox"
        checked={isDisabled}
        onChange={this.onChangeDisable} />
      isDisabled
      <SortableListParts
        items={parts}
        onSortEnd={this.onSortEnd}
        onSortItemsEnd={this.onSortItemsEnd}
        helperClass={style.dragged}
        distance={3}
        activeItem={activeItem}
        onChangeActiveItem={this.onChangeActiveItem}
        isDisabled={isDisabled}
      />
    </div>;
  }
}
