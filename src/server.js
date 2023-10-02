const express = require('express');
const app = express();
const cors = require("cors")
const { v4: uuidv4 } = require('uuid');

// Для сохранения выбора и сортировки элементов
let selectedItems = [];
let sortedItems = [];
// Список загружаемых элементов
let allItems = [
	{
		id: uuidv4(),
		text: 'hi',
	}, 
	{
		id: uuidv4(),
		text: 'hello',
	},
	{
		id: uuidv4(),
		text: 'hello2',
	},
	{
		id: uuidv4(),
		text: 'helo',
	}, 
	{
		id: uuidv4(),
		text: 'wassup',
	},
	{
		id: uuidv4(),
		text: 'test1',
	}, 
	{
		id: uuidv4(),
		text: 'test2',
	},
	{
		id: uuidv4(),
		text: 'test22',
	},
	{
		id: uuidv4(),
		text: 'text',
	}, 
	{
		id: uuidv4(),
		text: 'Another text',
	},
	{
		id: uuidv4(),
		text: 'wassup',
	},
	{
		id: uuidv4(),
		text: 'unique text',
	}, 
	{
		id: uuidv4(),
		text: 'one more line',
	},
	{
		id: uuidv4(),
		text: 'hi again',
	},
	{
		id: uuidv4(),
		text: 'hello again',
	}, 
	{
		id: uuidv4(),
		text: 'hey!',
	},
	{
		id: uuidv4(),
		text: 'hey2',
	},
	{
		id: uuidv4(),
		text: 'unique maybe',
	}, 
	{
		id: uuidv4(),
		text: 'another line',
	},
	{
		id: uuidv4(),
		text: 'hi to you',
	},
	{
		id: uuidv4(),
		text: 'hello here',
	}, 
	{
		id: uuidv4(),
		text: 'hey yo!',
	}];

app.use(express.json());

const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

// Обработчик запроса для сохранения выбранных элементов
app.post('/api/select', (req, res) => {
  const { items } = req.body;
  selectedItems = items;
  res.status(200).json({ message: 'Выбранные элементы сохранены успешно.' });
});

// Обработчик запроса для сохранения отсортированных элементов
app.post('/api/sort', (req, res) => {
  const { items } = req.body;
  const sortedTexts = items.map(item => item.text);
  const remainingItems = allItems.filter(item => !sortedTexts.includes(item.text));
  sortedItems = [...items, ...remainingItems];
  res.status(200).json({ message: 'Отсортированные элементы сохранены успешно.' });
});

// Обработчик запроса для получения сохраненных выбранных элементов
app.get('/api/select', (req, res) => {
  res.status(200).json({ items: selectedItems });
});
  
// Обработчик запроса для получения сохраненных элементов (в параметрах указываются лимит элементов, загружаемых за один раз, текущий блок элементов, текст для поиска)
app.get('/api/get', (req, res) => {
	let { limit, page, text } = req.query;
	page = page || 1;
	limit = limit || 10;
	const pageEnd = page * limit;
	const offset = pageEnd - limit;
	let targetedItems;
	//загружаем либо оригинальный список, либо список с внесенными изменениями в сортировке
	if(sortedItems.length > 0){
		targetedItems = sortedItems;
	} else {
		targetedItems = allItems;
	}
	// Поиск элементов
	let searchedItems;
	if(text !== ''){
		searchedItems = targetedItems.filter(item =>
		  item.text.toLowerCase().includes(text.toLowerCase())
	  );
	} else {
		searchedItems = targetedItems;
	}
  	res.status(200).json({ total: searchedItems.length, items: searchedItems.slice(offset, pageEnd)});
});

app.listen(3001, () => {
  console.log('Сервер запущен на порту 3001.');
});