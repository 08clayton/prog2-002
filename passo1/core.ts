
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
   throw new Error("Erro na hora de salvar os dados no arquivo: " + error.message);
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

async function loadFromFileStatus(filePath: string) {
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

export class Item {
  private description: string;
  private status: boolean;

  constructor(description: string, status: boolean = false) {
    this.description = description;
    this.status = status;
  }

  updateDescription(newDescription: string) {
    this.description = newDescription;
  }

  setStatus(newStatus: boolean) {
    this.status = newStatus;
  }

  toJSON() {
    return {
      description: this.description,
      status: this.status
    }
  }
}

export class ToDo {
  private filepath: string;
  private items!: Promise<Item[]>;

  constructor(filepath: string) {
    this.filepath = filepath;
    this.items = this.loadFromFile();
  }

  private async saveToFile(): Promise<void> {
    try {
      const items = await this.items;
      const file = Bun.file(this.filepath);
      const data = JSON.stringify(items);
      await Bun.write(file, data);
    } catch (error) {
      console.error('Error saving to file:', error);
    }
  }

  private async loadFromFile(): Promise<Item[]> {
    const file = Bun.file(this.filepath);
    if (!(await file.exists()))
      return [] as Item[]
    const data = await file.text();
    return JSON.parse(data).map((itemData: any) => new Item(itemData.description, itemData.status)) as Item[];
  }

  async addItem(item: Item) {
    const items = await this.items;
    items.push(item);
    this.saveToFile();
  }

  async getItems() {
    return await this.items
  }

  async updateItem(index: number, newItem: Item) {
    const items = await this.items;
    if (index < 0 || index >= items.length) 
      throw new Error('Index out of bounds');
    items[index] = newItem;
    this.saveToFile();
  }

  async removeItem(index: number) {
    const items = await this.items;
    if (index < 0 || index >= items.length) 
      throw new Error('Index out of bounds');
    items.splice(index, 1);
    this.saveToFile();
  }

  async findItemByDescription(description: string): Promise<Item | undefined> {
    const items = await this.items;
    return items.find(item => item.toJSON().description === description);    
  }

  async findItemByIndex(index: number): Promise<Item | undefined> {
    const items = await this.items;
    if (index < 0 || index >= items.length) 
      throw new Error('Index out of bounds');
    return items[index];
  }

  async removeAll() {
    this.items = Promise.resolve([]);
    await this.saveToFile();
  }

  async ItemStatus(index: number, newStatus: boolean) {
    const getItems = async() => await this.items;
    const allItems = await getItems();
    
    if (index < 0 || index >= allItems.length) {
      throw new Error('Index out of bounds');
    }
    const currentItem = allItems[index];
    currentItem.setStatus(newStatus);
    this.items = Promise.resolve(allItems);
    await this.saveToFile();
  }
}