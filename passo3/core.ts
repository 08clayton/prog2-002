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
      status: this.status,
    };
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
      await Bun.write(file, JSON.stringify(items));
    } catch (error) {
      console.error("Erro ao salvar no arquivo:", error);
    }
  }

  private async loadFromFile(): Promise<Item[]> {
    const file = Bun.file(this.filepath);
    if (!(await file.exists())) return [];
    const data = await file.text();
    return JSON.parse(data).map(
      (itemData: any) => new Item(itemData.description, itemData.status)
    );
  }

  async addItem(item: Item) {
    const items = await this.items;
    items.push(item);
    await this.saveToFile();
  }

  async getItems() {
    return await this.items;
  }

  async updateItem(index: number, newItem: Item) {
    const items = await this.items;
    if (index < 0 || index >= items.length)
      throw new Error("Index fora dos limites");
    items[index] = newItem;
    await this.saveToFile();
  }

  async removeItem(index: number) {
    const items = await this.items;
    if (index < 0 || index >= items.length)
      throw new Error("Index fora dos limites");
    items.splice(index, 1);
    await this.saveToFile();
  }

  async removeAll() {
    this.items = Promise.resolve([]);
    await this.saveToFile();
  }

  async ItemStatus(index: number, newStatus: boolean) {
    const items = await this.items;
    if (index < 0 || index >= items.length)
      throw new Error("Index fora dos limites");
    items[index].setStatus(newStatus);
    await this.saveToFile();
  }

  async findItemByDescription(description: string): Promise<Item | undefined> {
    const items = await this.items;
    return items.find((item) => item.toJSON().description === description);
  }

  async findItemByIndex(index: number): Promise<Item | undefined> {
    const items = await this.items;
    if (index < 0 || index >= items.length)
      throw new Error("Index fora dos limites");
    return items[index];
  }
}