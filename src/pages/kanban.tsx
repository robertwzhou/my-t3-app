// src/pages/kanban.tsx
import { useAtom } from 'jotai';
import { listsAtom, itemsAtom } from '../atoms';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const Kanban = () => {
  const [lists, setLists] = useAtom(listsAtom);
  const [items, setItems] = useAtom(itemsAtom);
  const [newList, setNewList] = useState('');

  const addList = () => {
    if (newList.trim() === '') return;
    setLists([...lists, newList]);
    setItems({ ...items, [newList]: [] });
    setNewList('');
  };

  const removeList = (list: string) => {
    const newLists = lists.filter((l) => l !== list);
    const newItems = { ...items };
    delete newItems[list];
    setLists(newLists);
    setItems(newItems);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = source.droppableId;
    const destList = destination.droppableId;

    const sourceItems = [...items[sourceList]];
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (sourceList === destList) {
      sourceItems.splice(destination.index, 0, movedItem);
      setItems({ ...items, [sourceList]: sourceItems });
    } else {
      const destItems = [...items[destList]];
      destItems.splice(destination.index, 0, movedItem);
      setItems({ ...items, [sourceList]: sourceItems, [destList]: destItems });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Lists</h1>
      <input
        type="text"
        value={newList}
        onChange={(e) => setNewList(e.target.value)}
        placeholder="New List"
        style={{ marginRight: '10px' }}
      />
      <button onClick={addList}>Add List</button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          {lists.map((list) => (
            <Droppable key={list} droppableId={list}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ border: '1px solid black', padding: '10px', width: '200px' }}
                >
                  <h2>{list}</h2>
                  <button onClick={() => removeList(list)}>Delete List</button>
                  <List listName={list} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

const List = ({ listName }) => {
  const [items, setItems] = useAtom(itemsAtom);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() === '') return;
    setItems({ ...items, [listName]: [...items[listName], newItem] });
    setNewItem('');
  };

  return (
    <div>
      <input
        type="text"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        placeholder="New Item"
        style={{ marginRight: '10px' }}
      />
      <button onClick={addItem}>Add Item</button>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {items[listName]?.map((item, index) => (
          <Draggable key={item} draggableId={item} index={index}>
            {(provided) => (
              <li
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                  ...provided.draggableProps.style,
                  border: '1px solid gray',
                  padding: '5px',
                  margin: '5px 0',
                  backgroundColor: 'white',
                }}
              >
                {item}
              </li>
            )}
          </Draggable>
        ))}
      </ul>
    </div>
  );
};

export default Kanban;