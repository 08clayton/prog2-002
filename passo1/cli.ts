import { ToDo, Item } from './core.ts';

const file = process.argv[2]
const command = process.argv[3];

if (!file) {
  console.error("Por favor, forneça o caminho do arquivo.");
  process.exit(1);
}

const todo = new ToDo(file);

if (command === "add") {
  const itemDescription = process.argv[4];

  if (!itemDescription) {
    console.error("Por favor, forneça uma descrição para o item.");
    process.exit(1);
  }
  const item = new Item(itemDescription);
  await todo.addItem(item);
  console.log(`Item "${itemDescription}" adicionado com sucesso!`);
  process.exit(0);
}

if (command === "list") {
  const items = await todo.getItems();

  if (items.length === 0) {
    console.log("Nenhum item achado na lista.");
    process.exit(0);
  }
    
      console.log("Lista de itens:");
  items.forEach((item, index) => console.log(`${index}: ${item.toJSON().description}`));
  process.exit(0);
    }
  

if (command === "search"){
    if (!process.argv[3]) {
    console.error("Por favor, escreva um índice válido.");
    process.exit(1);
  }
  const items = await todo.getItems();
  if (items.length === 0) {
    console.log("Nenhum item achado na lista.");
    process.exit(0);
  }

  const pChave = process.argv[3];
  const search = items.filter(item => item.toJSON().description.includes(pChave))
  if (search.length === 0) {
    console.log("nenhum item achado para essa pesquisa.");
    process.exit(0);
  }
  search.forEach((item, index) => {
          console.log(`${index}: ${item.toJSON().description}`);
  })
  process.exit(0);
}
if (command === "update") {
  if (!process.argv[3]) {
    console.error("Por favor, escreva um índice válido.");
    process.exit(1);
  }

  const index = parseInt(process.argv[3]);
  const newItem = process.argv[4];

  if (isNaN(index) || !newItem) {
    console.error("Por favor, escreva um índice válido e um novo item.");
    process.exit(1);
  }

  try {
    await todo.updateItem(index, new Item(newItem));
    console.log(`Item no índice ${index} atualizado para "${newItem}".`);
    process.exit(0);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

if (command === "remove") {
  if (!process.argv[3]) {
    console.error("Por favor, escreva um índice válido.");
    process.exit(1);
  }
  

  const index = parseInt(process.argv[3]);

  if (isNaN(index)) {
    console.error("Por favor, escreva um índice válido para remover.");
    process.exit(1);
  }
  
  try {
    await todo.removeItem(index);
    console.log(`Item no índice ${index} removido com sucesso.`);
    process.exit(0);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}
if (command === "clear") { 
  try {
    await todo.removeAll();
    console.log(`todos os itens removidos com sucesso.`);
    process.exit(0);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}
if (command === "status"){
  if (!process.argv[3]) {
    console.error("Por favor, escreva um índice válido.");
    process.exit(1);
  }

  const index = parseInt(process.argv[3]);
  const newstatus = process.argv[4];

  if (isNaN(index) || !newstatus) {
    console.error("Por favor, escreva um índice válido e um novo status [concluido/pendente].");
    process.exit(1);
  }
  try{
    const status = newstatus === "concluido"
    await todo.ItemStatus(index, status)
    console.log(`Item no índice ${index} atualizado para "${newstatus}".`);
    process.exit(0);
  }catch (error: any){
    console.error(error.message);
    process.exit(1);
  }
}



if (command ==="help"){
  console.log("os comandos que dá pra usar são: 'list', 'add', 'update', 'status', 'remove', 'clear', 'search'");
  process.exit(0)
}
console.error("Comando nao encontrado. Use 'list', 'add', 'update', 'status', 'remove', 'clear', 'search'.");
process.exit(1)