import { ToDo, Item } from './core.ts';

const file = process.argv[2];
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

  await todo.addItem(new Item(itemDescription));
  console.log(`Item "${itemDescription}" adicionado com sucesso!`);
}

else if (command === "list") {
  const items = await todo.getItems();

  if (items.length === 0) {
    console.log("Nenhum item na lista.");
  } else {
    console.log("Lista de itens:");
    items.forEach((item, index) => {
      const { description, status } = item.toJSON();
      console.log(`${index}: ${description} [${status ? "concluido" : "pendente"}]`);
    });
  }
}

else if (command === "search") {
  const pChave = process.argv[4];

  if (!pChave) {
    console.error("Por favor, escreva um termo de busca válido.");
    process.exit(1);
  }

  const items = await todo.getItems();

  if (items.length === 0) {
    console.log("Nenhum item na lista.");
  } else {
    const results = items.filter((item) =>
      item.toJSON().description.includes(pChave)
    );

    if (results.length === 0) {
      console.log("Nenhum item encontrado para essa pesquisa.");
    } else {
      results.forEach((item, index) => {
        console.log(`${index}: ${item.toJSON().description}`);
      });
    }
  }
}

else if (command === "update") {
  const index = parseInt(process.argv[4]);
  const newDescription = process.argv[5];

  if (isNaN(index) || !newDescription) {
    console.error("Por favor, escreva um índice válido e uma nova descrição.");
    process.exit(1);
  }

  try {
    await todo.updateItem(index, new Item(newDescription));
    console.log(`Item no índice ${index} atualizado para "${newDescription}".`);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

else if (command === "remove") {
  const index = parseInt(process.argv[4]);

  if (isNaN(index)) {
    console.error("Por favor, escreva um índice válido para remover.");
    process.exit(1);
  }

  try {
    await todo.removeItem(index);
    console.log(`Item no índice ${index} removido com sucesso.`);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

else if (command === "clear") {
  try {
    await todo.removeAll();
    console.log("Todos os itens removidos com sucesso.");
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

else if (command === "status") {
  const index = parseInt(process.argv[4]);
  const newstatus = process.argv[5];

  if (isNaN(index) || !newstatus) {
    console.error("Por favor, escreva um índice válido e um novo status [concluido/pendente].");
    process.exit(1);
  }

  try {
    await todo.ItemStatus(index, newstatus === "concluido");
    console.log(`Item no índice ${index} atualizado para "${newstatus}".`);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

else if (command === "help") {
  console.log("Comandos disponíveis: 'list', 'add', 'update', 'status', 'remove', 'clear', 'search'.");
}

else {
  console.error("Comando não encontrado. Use 'list', 'add', 'update', 'status', 'remove', 'clear', 'search'.");
  process.exit(1);
}