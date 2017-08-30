import React, {Component} from 'react';
import {SortableContainer, SortableElement, arrayMove, DragLayer} from '../index';
import style from './NestedListsWithMultipleDrag.scss';

const dragLayer = new DragLayer();

const SortableItem = SortableElement((props)=>{
  const value = props.item;
  return <div onClick={props.onSelect} className={props.className}>
            <span style={{display: 'inline-block', width: '50px'}}>{value.ind}</span>
            {value.value}
        </div>;
});

const SortableListItems = SortableContainer(({items}) =>
    <div>
        {items.map((value, index) => (
          <SortableItem
            key={index}
            index={index}
            item={value}
          />
        ))}
    </div>
);

const SortablePart = SortableElement(props =>
    <div>
        <div><span style={{marginLeft: '50px'}}>{props.item.name}</span></div>
        <SortableListItems
            {...props}
            items={props.item.items}
            dragLayer={dragLayer}
            distance={3}
            helperClass={style.selected}
            isMultiple={true}
            helperCollision={{top:0, bottom:0}}
        />
    </div>
);

const SortableListParts = SortableContainer(({items, onSortItemsEnd}) =>
    <div style={{height: '600px', overflow: 'auto', userSelect:'none'}}>
        {items.map((value, index) => (
            <SortablePart
                key={index}
                index={index}
                item={value}
                id={index}
                onMultipleSortEnd={onSortItemsEnd}/>
        ))}
    </div>
);

const getParts = (countParts, countLessons)=> {
  const parts = [];
  for (let i=0; i<countParts; i++){
    const lessons = [];
    for (let j=0;j<countLessons;j++){
      lessons.push('Lesson-'+(i+1)+'-'+(j+1));
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
      parts:getParts(20, 5),
    };
  }
  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState({
      parts: arrayMove(this.state.parts, oldIndex, newIndex),
    });
  }
  onSortItemsEnd = ({newListIndex, newIndex, items}) => {
    const parts = this.state.parts.slice();
    const itemsValue = [];
    items.forEach(item=>{
      itemsValue.push(parts[item.listId].items[item.id]);
    });
    for (let i=items.length-1;i>=0;i--){
      const item = items[i];
      parts[item.listId].items.splice(item.id,1);
    }
    parts[newListIndex].items.splice(newIndex, 0, ...itemsValue);
    this.setState({
      parts: parts,
    });
  }
  render() {
    const parts = this.state.parts.map((value, index)=>{
      return {
        name: value.name,
        items: value.items.map((value, ind)=>{
          return {
            value,
            ind:(index+1)+'.'+(ind+1),
          };
        }),
      };
    });
    return <div>
        <SortableListParts
            items={parts}
            onSortEnd={this.onSortEnd}
            onSortItemsEnd={this.onSortItemsEnd}
            helperClass={style.selected}/>
    </div>;
  }
}
