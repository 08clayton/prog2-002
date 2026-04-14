import todo from './core.ts';

const command = process.argv[2]; 

if (command === "add") {
  const item = process.argv[3];
  
  if (!item) {
    console.error("Por favor, forneça um item para adicionar.");
    process.exit(1);
  }

  await todo.addItem(item);
  console.log(`Item "${item}" adicionado com sucesso!`);
  process.exit(0);
}

if (command === "list") {
  const items = await todo.getItems();

  if (items.length === 0) {
    console.log("Nenhum item na lista.");
    process.exit(0);
  }
    if (process.argv.length >= 4){
      const filtro = process.argv[3]
      items.forEach((item, index) => {
      
      if (filtro === "concluido"){
        if (item.status === true){
          console.log(`${index}: ${item.text}`);
          console.log(`   criado em: ${item.creationTime} | alterado em: ${item.updateTime}`)
          console.log(`   a tarefa esta: ${item.status ? "concluido": "pendente"}`);
      }}
      if (filtro === "pendente"){
        if (item.status === false){
          console.log(`${index}: ${item.text}`);
          console.log(`   criado em: ${item.creationTime} | alterado em: ${item.updateTime}`)
          console.log(`   a tarefa esta: ${item.status ? "concluido": "pendente"}`);
      }}
    
    })
  }
    else{
      items.forEach((item, index) => {
        console.log(`${index}: ${item.text}`);
        console.log(`   criado em: ${item.creationTime} | alterado em: ${item.updateTime}`)
        console.log(`   a tarefa esta: ${item.status ? "concluido": "pendente"}`);
      })
    };
    
    process.exit(0);
}
if (command === "search"){
    if (!process.argv[3]) {
    console.error("Por favor, forneça um índice válido.");
    process.exit(1);
  }
  const items = await todo.getItems();
  if (items.length === 0) {
    console.log("Nenhum item na lista.");
    process.exit(0);
  }

  const pChave = process.argv[3];
  const search = items.filter(item => item.text.includes(pChave))
  if (search.length === 0) {
    console.log("nenhum item encontrado para essa pesquisa.");
    process.exit(0);
  }
  search.forEach((item, index) => {
          console.log(`${index}: ${item.text}`);
          console.log(`   criado em: ${item.creationTime} | alterado em: ${item.updateTime}`)
          console.log(`   a tarefa esta: ${item.status ? "concluido": "pendente"}`); 
  })
  process.exit(0);
}
if (command === "update") {
  if (!process.argv[3]) {
    console.error("Por favor, forneça um índice válido.");
    process.exit(1);
  }

  const index = parseInt(process.argv[3]);
  const newItem = process.argv[4];

  if (isNaN(index) || !newItem) {
    console.error("Por favor, forneça um índice válido e um novo item.");
    process.exit(1);
  }

  try {
    await todo.updateItem(index, newItem);
    console.log(`Item no índice ${index} atualizado para "${newItem}".`);
    process.exit(0);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

if (command === "remove") {
  if (!process.argv[3]) {
    console.error("Por favor, forneça um índice válido.");
    process.exit(1);
  }
  

  const index = parseInt(process.argv[3]);

  if (isNaN(index)) {
    console.error("Por favor, forneça um índice válido para remover.");
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
    console.error("Por favor, forneça um índice válido.");
    process.exit(1);
  }

  const index = parseInt(process.argv[3]);
  const newstatus = process.argv[4];

  if (isNaN(index) || !newstatus) {
    console.error("Por favor, forneça um índice válido e um novo status [concluido/pendente].");
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
  console.log("os comandos utilizaveis são: 'add', 'list', 'update', 'remove', 'status', 'clear', 'search'.")
  process.exit(0)
}
console.error("Comando desconhecido. Use 'add', 'list', 'update', 'remove', 'status', 'clear', 'search'.");
process.exit(1);