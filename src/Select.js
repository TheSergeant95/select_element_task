import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const Select = () => {
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [selectCompleted, setSelectCompleted] = useState(true);
  const [sortedItems, setSortedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка элементов с сервера (вызывается при монтировании компонента, скролле вниз и обновлении поиска)
  useEffect(() => {
	if(fetching){
		// Чтобы скролл не сбрасывался при каждой подгрузке новых элементов
		if(sortedItems.length === 0) {
			setIsLoading(true);
		}
		fetch('http://localhost:3001/api/get?'+ new URLSearchParams({
			page: currentPage,
			limit: 10,
			text: searchQuery,
		}))
		  .then(response => response.json())
		  .then(data => {
			setSortedItems([...sortedItems, ...data.items]);
			setTotal(data.total);
			setCurrentPage(prev => prev + 1);
		  })
		  .catch(error => {
			console.error('Ошибка при загрузке элементов:', error);
		  }).finally(() => {
			setFetching(false);
			setIsLoading(false);
		  });
	}
	fetch('http://localhost:3001/api/select')
	.then(response => response.json())
	.then(data => {
		setSelectedItems(data.items);
	})
	.catch(error => {
		console.error('Ошибка при загрузке элементов:', error);
	})
  }, [fetching]);
  
  //Функция, вызываемая при скролле вниз
  const scrollHandler = (e) => {
	if(e.target.scrollHeight - (e.target.scrollTop + 500) < 100 && sortedItems.length < total) {
		setFetching(true);
	}
  }

  // Обработчик изменения выбранных элементов
  const handleSelect = async (itemId) => {
	setSelectCompleted(false);
	setSelectedItems(prevSelected => {
		if (prevSelected.includes(itemId)) {
			return prevSelected.filter(id => id !== itemId);
		} else {
			return [...prevSelected, itemId];
		}
	});
  };
  
  //Сохранение выбранных элементов на сервере
  useEffect(() => {
	const saveSelectedItems = async () => {
	  try {
		const response = await fetch('http://localhost:3001/api/select', {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ items: selectedItems })
		});
		const data = await response.json();
		console.log(data.message);
	  } catch (error) {
		console.error('Ошибка при сохранении выбранных элементов:', error);
	  }
	};
  
	if(selectCompleted === false){
		saveSelectedItems();
	}
  }, [selectedItems]);

  //Функция, вызываемая при вводе в строку поиска символов
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
	setCurrentPage(1);
	setSortedItems([]);
	setFetching(true);
  };

  	// Функция для обновления списка после дропа элемента
	const handleDrop = (droppedItem) => {
		// Игнорировать вынос за пределы droppable-контейнера
		if (!droppedItem.destination) return;
		var updatedList = [...sortedItems];
		// Удалить перетаскиваемый элемент
		const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
		// добавить перетаскиваемый элемент
		updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
		// обновить стейт
		setSortedItems([...updatedList]);
		// записать порядок на сервере
		fetch('http://localhost:3001/api/sort', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ items: [...updatedList] }),
		  })
			.then(response => response.json())
			.then(data => console.log(data.message))
			.catch(error => console.error('Ошибка при сохранении отсортированных элементов:', error));
  	};
 

  return (
    <div>
      	<h2>Селект</h2>
		<input
			type="text"
			className='search'
			value={searchQuery}
			onChange={handleSearch}
			placeholder="Поиск..."
		/>
		{isLoading ? (
        <div>Loading items...</div>
      ) : (
		<DragDropContext onDragEnd={handleDrop}>
			<Droppable droppableId="items">
			{(provided) => (
				<div 
					className='items'
					{...provided.droppableProps}
					ref={provided.innerRef}
					onScroll={scrollHandler}
				>
				{sortedItems.map((item, index) => (
					<Draggable
						key={item.id}
						draggableId={item.id}
						index={index}
				 	>
						{(provided) => (
							<div
							{...provided.draggableProps}
                            {...provided.dragHandleProps}
							onClick={() => handleSelect(item.id)}
                            ref={provided.innerRef}>
								<div className='item' style={{
									// Применить стили к выделенным объектам
									backgroundColor: selectedItems.includes(item.id) ? '#fff700' : '#fff',
								}}>
									<div
										style={{
											fontWeight: selectedItems.includes(item.id) ? 'bold' : 'normal',
										}}
									>
									{item.text}
									</div>
								</div>
							</div>
						)}
					</Draggable>
				))}
				{provided.placeholder}
				</div>
			)}
			</Droppable>
		</DragDropContext>
		)}
    </div>
  );
};

export default Select;