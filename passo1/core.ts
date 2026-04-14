
type Todoitem = {
  text: string;
  creationTime: string;
  updateTime: string;
  status: boolean;
}

const jsonFilePath = import.meta.dir + '/data.todo.json';
const list: Todoitem[] = await loadFromFile();



async function loadFromFile() {
  try {
    const file = Bun.file(jsonFilePath);
    const content = await file.text();
    return JSON.parse(content) as Todoitem[];
  } catch (error: any) {
    if (error.code === 'ENOENT')
      return [];
    throw error;
  }
}

async function saveToFile() {
  try {
    await Bun.write(jsonFilePath, JSON.stringify(list));
  } catch (error: any) {
   throw new Error("Erro ao salvar os dados no arquivo: " + error.message);
  }
}
async function addItem(text: string) {
  const now = new Date().toLocaleString('pt-BR');
  list.push({text, creationTime: now, updateTime: now, status: false});
  await saveToFile();
}

async function ItemStatus(index:number, newstatus:boolean) {
  if (index < 0 || index >= list.length)
    throw new Error("Index fora dos limites");
  const item = list[index];
  if (!item) throw new Error("Item não encontrado");
  item.status = newstatus;
  await saveToFile(); 
}
async function getItems() {
  return list;
}
async function updateItem(index: number, newItem: string) { 
  if (index < 0 || index >= list.length)
    throw new Error("Index fora dos limites"); 
  const item = list[index];
  if (!item) throw new Error("Item não encontrado");
  item.text = newItem; 
  item.updateTime = new Date().toLocaleString('pt-BR'); 
  await saveToFile(); 
}
async function removeItem(index: number) {
  if (index < 0 || index >= list.length)
    throw new Error("Index fora dos limites");
  list.splice(index, 1);
  await saveToFile();
}
async function removeAll() {
  list.length = 0;
  await saveToFile();
}
export default { addItem, getItems, updateItem, removeItem, ItemStatus, removeAll };